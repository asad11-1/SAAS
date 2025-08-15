'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MapPin, Building2, Phone, Mail, Filter, X, 
  Loader2, AlertCircle, Navigation, Eye, ChevronDown,
  ChevronUp, Users, Star, Map, List, Grid, Sparkles,
  TrendingUp, Globe, ArrowRight, Layers, Target
} from 'lucide-react';
import { apiService } from '../lib/api';

interface Company {
  id: string;
  naam: string;
  straat?: string;
  huisnummer?: string;
  postcode?: string;
  plaats?: string;
  land?: string;
  emailadres?: string;
  website?: string;
  telefoon?: string;
  kvk_nummer?: string;
  btw_nummer?: string;
  algemene_omschrijving?: string;
  soort_bedrijf?: string;
  status: string;
  created_at: string;
}

interface CompanyMarker {
  company: Company;
  marker: google.maps.Marker;
  infoWindow: google.maps.InfoWindow;
}

export default function CompaniesMapPage() {
  // Data states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  
  // UI states
  const [showSidebar, setShowSidebar] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [geocodingProgress, setGeocodingProgress] = useState<{
    current: number;
    total: number;
    currentCompany?: string;
  }>({ current: 0, total: 0 });
  
  // Map states
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const markersRef = useRef<CompanyMarker[]>([]);

  // Google Maps API Key from environment
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDVX1RY6nhoYqA9Tk02VV49ATsKfjkbPsI';

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Clear map when switching away from map view
  useEffect(() => {
    if (viewMode !== 'map') {
      // Clean up map resources when switching away from map view
      clearMarkers();
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
      setMapLoaded(false);
      setMapInitialized(false);
    }
  }, [viewMode]);

  // Initialize Google Maps when switching to map view
  useEffect(() => {
    let isComponentMounted = true;

    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google?.maps) {
          initializeMap();
          return;
        }

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          existingScript.addEventListener('load', () => {
            if (isComponentMounted) initializeMap();
          });
          existingScript.addEventListener('error', () => {
            if (isComponentMounted) {
              setMapError('Failed to load Google Maps');
            }
          });
          return;
        }

        // Create and load new script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          if (isComponentMounted) {
            setTimeout(() => {
              if (isComponentMounted) initializeMap();
            }, 100);
          }
        };

        script.onerror = () => {
          if (isComponentMounted) {
            setMapError('Failed to load Google Maps. Please check your internet connection.');
          }
        };

        document.head.appendChild(script);

      } catch (err) {
        if (isComponentMounted) {
          console.error('Error loading Google Maps:', err);
          setMapError('Failed to initialize Google Maps');
        }
      }
    };

    const initializeMap = () => {
      // Reset map state and check if we can initialize
      if (!mapRef.current || !window.google?.maps || viewMode !== 'map') return;

      try {
        // Clear any existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current = null;
        }
        
        // Clear existing markers
        clearMarkers();

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 52.3676, lng: 4.9041 }, // Amsterdam, Netherlands
          zoom: 8,
          styles: [
            {
              featureType: "all",
              elementType: "geometry.fill",
              stylers: [{ weight: "1.5" }]
            },
            {
              featureType: "all",
              elementType: "geometry.stroke",
              stylers: [{ color: "#c8d0e7" }]
            },
            {
              featureType: "landscape",
              elementType: "geometry.fill",
              stylers: [{ color: "#fbfcfe" }]
            },
            {
              featureType: "poi",
              elementType: "all",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "road",
              elementType: "geometry.fill",
              stylers: [{ color: "#f1f3f7" }]
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#6b7280" }]
            },
            {
              featureType: "road.highway",
              elementType: "geometry.fill",
              stylers: [{ color: "#e5e7eb" }]
            },
            {
              featureType: "water",
              elementType: "geometry.fill",
              stylers: [{ color: "#bfdbfe" }]
            },
            {
              featureType: "administrative",
              elementType: "geometry.stroke",
              stylers: [{ color: "#d1d5db", weight: 0.5 }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_CENTER
          },
          gestureHandling: 'greedy'
        });

        mapInstanceRef.current = map;
        geocoderRef.current = new window.google.maps.Geocoder();
        setMapLoaded(true);
        setMapInitialized(true);
        setMapError(null);
        
        console.log('✅ Google Maps loaded successfully');

      } catch (err) {
        console.error('❌ Error initializing map:', err);
        setMapError('Failed to initialize map');
      }
    };

    // Only load maps when in map view and not already initialized
    if (viewMode === 'map' && !mapInitialized) {
      loadGoogleMaps();
    }

    return () => {
      isComponentMounted = false;
    };
  }, [viewMode, mapInitialized]);

  // Filter companies when search or filter changes
  useEffect(() => {
    let filtered = companies;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(company =>
        company.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.plaats?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.soort_bedrijf?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.kvk_nummer?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter);
    }

    setFilteredCompanies(filtered);
  }, [companies, searchQuery, statusFilter]);

  // Geocode ALL companies when map is ready and companies are loaded
  useEffect(() => {
    if (mapLoaded && mapInitialized && mapInstanceRef.current && geocoderRef.current && companies.length > 0 && viewMode === 'map') {
      geocodeAllCompanies();
    }
  }, [mapLoaded, mapInitialized, companies, viewMode]);

  // Handle selected company highlight
  useEffect(() => {
    if (selectedCompanyId && viewMode === 'map' && mapInitialized) {
      const selectedMarker = markersRef.current.find(m => m.company.id === selectedCompanyId);
      if (selectedMarker && mapInstanceRef.current) {
        // Close all info windows first
        markersRef.current.forEach(({ infoWindow }) => infoWindow.close());
        
        // Center map on selected company
        mapInstanceRef.current.panTo(selectedMarker.marker.getPosition()!);
        mapInstanceRef.current.setZoom(16);
        
        // Open info window with delay for smooth animation
        setTimeout(() => {
          selectedMarker.infoWindow.open(mapInstanceRef.current!, selectedMarker.marker);
        }, 500);
        
        // Highlight marker with bounce animation
        selectedMarker.marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => {
          if (selectedMarker.marker) {
            selectedMarker.marker.setAnimation(null);
          }
        }, 2000);

        // Update marker icon to highlight
        const highlightIcon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: '#fbbf24',
          fillOpacity: 1,
          strokeColor: '#f59e0b',
          strokeWeight: 4,
        };
        selectedMarker.marker.setIcon(highlightIcon);

        // Reset other markers
        markersRef.current.forEach(({ marker, company }) => {
          if (company.id !== selectedCompanyId) {
            const normalIcon = {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: company.status === 'actief' ? '#8b5cf6' : '#6b7280',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            };
            marker.setIcon(normalIcon);
          }
        });
      }
    }
  }, [selectedCompanyId, viewMode, mapInitialized]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCompanies();
      setCompanies(data);
      setFilteredCompanies(data);
      console.log(`✅ Fetched ${data.length} companies`);
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      setMapError('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearMarkers = () => {
    markersRef.current.forEach(({ marker, infoWindow }) => {
      marker.setMap(null);
      infoWindow.close();
    });
    markersRef.current = [];
  };

  const buildAddress = (company: Company): string => {
    const addressParts = [
      [company.straat, company.huisnummer].filter(Boolean).join(' '),
      company.postcode,
      company.plaats,
      company.land || 'Netherlands'
    ].filter(Boolean);
    
    return addressParts.join(', ');
  };

  const geocodeAllCompanies = async () => {
    if (!geocoderRef.current || !mapInstanceRef.current || !companies || viewMode !== 'map') return;

    clearMarkers();
    
    const companiesWithAddresses = companies.filter(company => 
      company.straat || company.plaats || company.postcode
    );

    if (companiesWithAddresses.length === 0) return;

    setGeocodingProgress({ current: 0, total: companiesWithAddresses.length });

    const bounds = new window.google.maps.LatLngBounds();
    let successCount = 0;

    for (let i = 0; i < companiesWithAddresses.length; i++) {
      const company = companiesWithAddresses[i];
      const address = buildAddress(company);
      
      setGeocodingProgress({ 
        current: i + 1, 
        total: companiesWithAddresses.length,
        currentCompany: company.naam
      });

      try {
        const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoderRef.current!.geocode({ address }, (results, status) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });

        if (results[0]) {
          const location = results[0].geometry.location;
          
          // Create custom marker icon
          const markerIcon = {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: company.status === 'actief' ? '#8b5cf6' : '#6b7280',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          };

          const marker = new window.google.maps.Marker({
            position: location,
            map: mapInstanceRef.current,
            title: company.naam,
            icon: markerIcon,
            animation: window.google.maps.Animation.DROP
          });

          // Create enhanced info window content
          const infoContent = `
            <div class="p-6 max-w-sm bg-gradient-to-br from-white via-purple-50 to-blue-50 rounded-2xl shadow-2xl border border-purple-100">
              <div class="flex items-start gap-4 mb-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-xl">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900 text-xl mb-2 leading-tight">${company.naam}</h3>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    company.status === 'actief' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }">
                    <div class="w-2 h-2 rounded-full mr-2 ${
                      company.status === 'actief' ? 'bg-emerald-500' : 'bg-gray-400'
                    }"></div>
                    ${company.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div class="space-y-3 text-sm">
                ${address ? `
                  <div class="flex items-start gap-3 p-3 bg-white/70 rounded-xl border border-purple-100">
                    <svg class="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span class="text-gray-700 font-medium">${address}</span>
                  </div>
                ` : ''}
                
                ${company.telefoon ? `
                  <div class="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-green-100">
                    <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span class="text-gray-700 font-medium">${company.telefoon}</span>
                  </div>
                ` : ''}
                
                ${company.emailadres ? `
                  <div class="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-blue-100">
                    <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span class="text-gray-700 font-medium">${company.emailadres}</span>
                  </div>
                ` : ''}
                
                ${company.soort_bedrijf ? `
                  <div class="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-orange-100">
                    <svg class="w-5 h-5 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2m-8-2v2m0 0H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-4"></path>
                    </svg>
                    <span class="text-gray-700 font-medium">${company.soort_bedrijf}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `;

          const infoWindow = new window.google.maps.InfoWindow({
            content: infoContent,
            maxWidth: 400
          });

          // Add click listener to marker
          marker.addListener('click', () => {
            // Close all other info windows
            markersRef.current.forEach(({ infoWindow: iw }) => iw.close());
            
            // Open this info window
            infoWindow.open(mapInstanceRef.current!, marker);
            
            // Set selected company
            setSelectedCompanyId(company.id);
          });

          markersRef.current.push({ company, marker, infoWindow });
          bounds.extend(location);
          successCount++;
        }

        // Add delay to avoid hitting rate limits
        if (i < companiesWithAddresses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 150));
        }

      } catch (error) {
        console.warn(`Failed to geocode ${company.naam}:`, error);
      }
    }

    // Fit map to show all markers
    if (successCount > 0) {
      if (successCount === 1) {
        // If only one marker, center on it with appropriate zoom
        mapInstanceRef.current.setCenter(markersRef.current[0].marker.getPosition()!);
        mapInstanceRef.current.setZoom(15);
      } else {
        // Fit bounds with padding
        mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
      }
    }

    setGeocodingProgress({ current: 0, total: 0 });
    console.log(`✅ Successfully geocoded ${successCount}/${companiesWithAddresses.length} companies`);
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompanyId(company.id);
    if (viewMode === 'list') {
      setViewMode('map');
    }
  };

  const uniqueStatuses = Array.from(new Set(companies.map(c => c.status))).filter(Boolean);
  const activeCompanies = companies.filter(c => c.status === 'actief').length;
  const companiesWithValidAddresses = companies.filter(c => c.straat || c.plaats || c.postcode).length;

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center relative overflow-hidden">
        {/* Enhanced animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-indigo-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-400/30 to-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
            <div className="absolute -inset-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-2xl animate-pulse"></div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Loading Companies Map
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xl max-w-md mx-auto leading-relaxed">
            Preparing your beautiful interactive company map experience...
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-150"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950 relative overflow-hidden flex flex-col">
      {/* Sophisticated animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-gradient-to-r from-purple-300/20 to-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-float-delay"></div>
        <div className="absolute -bottom-48 left-1/2 w-96 h-96 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-indigo-200/50 dark:border-indigo-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="group">
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -inset-3 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-3xl blur-xl animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-1">
                    Companies Explorer
                  </h1>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
                      <span className="font-medium">Discover {companies.length} companies</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{activeCompanies} active locations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Enhanced View Mode Toggle */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl p-1.5 flex shadow-2xl border border-indigo-200/50 dark:border-indigo-700/50">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                    viewMode === 'map'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105 shadow-purple-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <Map className="h-5 w-5" />
                  <span>Map View</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105 shadow-purple-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <List className="h-5 w-5" />
                  <span>List View</span>
                </button>
              </div>

              {/* Enhanced Sidebar Toggle */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 p-4 rounded-2xl shadow-2xl border border-indigo-200/50 dark:border-indigo-700/50 transition-all duration-300 hover:scale-110 hover:rotate-180 hover:shadow-purple-500/20"
                title="Toggle sidebar"
              >
                <Filter className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex relative z-10 min-h-0">
        {/* Enhanced Sidebar */}
        <div className={`${showSidebar ? 'w-96' : 'w-0'} transition-all duration-500 overflow-hidden bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-r border-indigo-200/50 dark:border-indigo-800/50 flex flex-col shadow-2xl`}>
          <div className="p-6 border-b border-indigo-200/50 dark:border-indigo-700/50 bg-gradient-to-r from-white/50 to-indigo-50/50 dark:from-gray-950/50 dark:to-indigo-950/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Search & Filter</h2>
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Enhanced Search Input */}
            <div className="relative mb-6 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search companies, locations, types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-indigo-200/50 dark:border-indigo-700/50 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-2xl focus:shadow-purple-500/20"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>

            {/* Enhanced Status Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Company Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-4 border border-indigo-200/50 dark:border-indigo-700/50 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <option value="all">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-100/80 to-indigo-100/80 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">{filteredCompanies.length}</div>
                <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">Found</div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowRight className="h-3 w-3 text-purple-500 group-hover:translate-x-1 transition-transform duration-300" />
                  <div className="text-xs text-purple-600 dark:text-purple-400">Listed</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-100/80 to-cyan-100/80 dark:from-emerald-900/40 dark:to-cyan-900/40 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">{companiesWithValidAddresses}</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Mappable</div>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-emerald-500 group-hover:bounce transition-transform duration-300" />
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">Located</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Companies List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Building2 className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No companies found</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Try adjusting your search criteria or filters to find the companies you're looking for.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCompanies.map((company, index) => (
                  <div
                    key={company.id}
                    onClick={() => handleCompanySelect(company)}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group animate-fadeInUp hover:shadow-xl ${
                      selectedCompanyId === company.id
                        ? 'bg-gradient-to-br from-purple-100/80 to-indigo-100/80 dark:from-purple-900/30 dark:to-indigo-900/30 border-purple-300 dark:border-purple-500 ring-2 ring-purple-500/30 shadow-2xl scale-[1.02]'
                        : 'bg-white/60 dark:bg-gray-900/60 border-white/50 dark:border-gray-700/50 hover:bg-gradient-to-br hover:from-purple-50/80 hover:to-indigo-50/80 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 hover:border-purple-300/50 dark:hover:border-purple-500/50 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
                            {company.naam}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 border ${
                            company.status === 'actief' 
                              ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700' 
                              : 'bg-gray-100/80 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700'
                          }`}>
                            {company.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          {company.plaats && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-purple-500 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400 font-medium truncate">{company.plaats}</span>
                            </div>
                          )}
                          {company.soort_bedrijf && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3 w-3 text-indigo-500 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400 truncate font-medium">{company.soort_bedrijf}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Enhanced hover effect */}
                        <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <ArrowRight className="h-3 w-3 text-purple-500 group-hover:translate-x-1 transition-transform duration-300" />
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            {viewMode === 'map' ? 'View on map' : 'Switch to map'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="flex-1 relative min-w-0">
          {viewMode === 'map' ? (
            <>
              {/* Map Container */}
              <div className="h-full relative">
                {mapError ? (
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                    <div className="text-center p-12 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-red-200/50 dark:border-red-800/50 max-w-md">
                      <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6 animate-pulse" />
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Map Error</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">{mapError}</p>
                      <button 
                        onClick={() => {
                          setMapError(null);
                          setMapLoaded(false);
                          setMapInitialized(false);
                          mapInstanceRef.current = null;
                        }}
                        className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                      >
                        Retry Loading
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    ref={mapRef} 
                    className="w-full h-full bg-gray-100 dark:bg-gray-800"
                    style={{ minHeight: '400px' }}
                  />
                )}

                {/* Enhanced Map Overlays */}
                {!mapError && (
                  <>
                    {/* Geocoding Progress */}
                    {geocodingProgress.total > 0 && (
                      <div className="absolute top-6 left-6 right-6 z-20">
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50 p-6 shadow-2xl">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl animate-pulse">
                              <MapPin className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-lg">
                                Mapping Companies ({geocodingProgress.current}/{geocodingProgress.total})
                              </p>
                              {geocodingProgress.currentCompany && (
                                <p className="text-gray-600 dark:text-gray-400 font-medium truncate">
                                  {geocodingProgress.currentCompany}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                              style={{ width: `${(geocodingProgress.current / geocodingProgress.total) * 100}%` }}
                            >
                              <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Map Stats */}
                    {markersRef.current.length > 0 && (
                      <div className="absolute top-6 right-6 z-20">
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50 p-4 shadow-2xl">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg animate-pulse"></div>
                            <span className="text-gray-700 dark:text-gray-300 font-bold">
                              {markersRef.current.length} companies mapped
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Legend */}
                    {markersRef.current.length > 0 && (
                      <div className="absolute bottom-6 left-6 z-20">
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50 p-4 shadow-2xl">
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-lg"></div>
                              <span className="text-gray-700 dark:text-gray-300 font-semibold">Active Companies</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow-lg"></div>
                              <span className="text-gray-700 dark:text-gray-300 font-semibold">Inactive Companies</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-yellow-400 shadow-lg animate-pulse"></div>
                              <span className="text-gray-700 dark:text-gray-300 font-semibold">Selected Company</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No mappable companies */}
                    {companies.length > 0 && companiesWithValidAddresses === 0 && geocodingProgress.total === 0 && (
                      <div className="absolute top-6 right-6 z-20">
                        <div className="bg-amber-50/95 dark:bg-amber-900/95 backdrop-blur-2xl rounded-2xl border border-amber-200/50 dark:border-amber-700/50 p-4 shadow-2xl">
                          <div className="flex items-center gap-3 text-sm">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <span className="text-amber-700 dark:text-amber-300 font-semibold">
                              No companies with valid addresses found
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            /* Enhanced List View */
            <div className="h-full overflow-y-auto p-8 bg-gradient-to-br from-white/50 to-indigo-50/50 dark:from-gray-950/50 dark:to-indigo-950/50 custom-scrollbar">
              <div className="max-w-6xl mx-auto">
                {filteredCompanies.length === 0 ? (
                  <div className="text-center py-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-indigo-200/50 dark:border-indigo-800/50">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                      <Building2 className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      No companies found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                      Try adjusting your search criteria to find the companies you're looking for.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
                      <Search className="h-5 w-5" />
                      <span className="font-medium">Refine your search above</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCompanies.map((company, index) => (
                      <div
                        key={company.id}
                        onClick={() => handleCompanySelect(company)}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-xl border transition-all duration-500 cursor-pointer group hover:shadow-2xl animate-fadeInUp ${
                          selectedCompanyId === company.id
                            ? 'border-purple-300 dark:border-purple-500 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-900/20 dark:to-indigo-900/20 ring-2 ring-purple-500/30 scale-105'
                            : 'border-indigo-200/50 dark:border-indigo-800/50 hover:border-purple-300/50 dark:hover:border-purple-500/50 hover:scale-105'
                        }`}
                      >
                        <div className="p-8">
                          <div className="flex items-start gap-6 mb-6">
                            <div className="relative">
                              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <Building2 className="h-8 w-8 text-white" />
                              </div>
                              <div className="absolute -inset-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                  {company.naam}
                                </h3>
                                <span className={`px-4 py-2 rounded-full text-xs font-bold flex-shrink-0 border ${
                                  company.status === 'actief' 
                                    ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700' 
                                    : 'bg-gray-100/80 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700'
                                }`}>
                                  {company.status.toUpperCase()}
                                </span>
                              </div>
                              {company.soort_bedrijf && (
                                <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">
                                  {company.soort_bedrijf}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {(company.straat || company.plaats) && (
                              <div className="flex items-start gap-3 p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-2xl border border-purple-100/50 dark:border-purple-800/50">
                                <MapPin className="h-5 w-5 flex-shrink-0 text-purple-600 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                  {[company.straat, company.huisnummer].filter(Boolean).join(' ')}, {[company.postcode, company.plaats].filter(Boolean).join(' ')}
                                </span>
                              </div>
                            )}
                            {company.emailadres && (
                              <div className="flex items-center gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
                                <Mail className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                <span className="text-gray-700 dark:text-gray-300 truncate font-medium">{company.emailadres}</span>
                              </div>
                            )}
                            {company.telefoon && (
                              <div className="flex items-center gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/50">
                                <Phone className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">{company.telefoon}</span>
                              </div>
                            )}
                          </div>

                          {/* Enhanced hover effect */}
                          <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                              <span className="text-sm font-semibold">Click to view on map</span>
                            </div>
                            <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 25s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .group:hover .group-hover\\:bounce {
          animation: bounce 0.6s ease-in-out;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(147, 51, 234, 0.3) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.5);
        }
      `}</style>
    </div>
  );
}