/**
 * VoyageBus - Modern Bus Reservation System
 * Pure Vanilla JavaScript Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Base URL for the VoyageBus Backend API
  const API_BASE_URL = 'http://localhost:5000/api';

  // =========================================================================
  // APP STATE
  // =========================================================================
  const state = {
    currentStep: 1,
    searchParams: {
      from: '',
      to: '',
      date: ''
    },
    filterOptions: {
      busTypes: ['ALL'],
      maxPrice: 1500,
      departureTime: null, // 'morning', 'afternoon', 'evening', 'night'
      sortBy: 'departure_asc'
    },
    availableBuses: [],
    selectedBus: null,
    busSeats: {
      lower: [],
      upper: []
    },
    selectedSeats: [], // Array of seat objects { id, deck, type, price, row, col }
    passengers: [],    // Array of { name, age, gender, seatId }
    contactInfo: {
      phone: '',
      email: '',
      aadhaar: '',
      maskedPhone: '',
      maskedAadhaar: ''
    },
    currentBooking: null,
    bookings: [
      // Sample preloaded booking for demo purposes
      {
        pnr: 'TN-BUS-739104',
        createdAt: '2026-10-20',
        from: 'Chennai',
        to: 'Madurai',
        fromCode: 'MAA',
        toCode: 'IXM',
        date: '2026-10-25',
        depTime: '22:00',
        arrTime: '06:00',
        duration: '8h 00m',
        boarding: 'Koyambedu Omni Bus Stand',
        dropping: 'Mattuthavani Integrated Bus Terminal',
        busName: 'Parveen Travels',
        busType: 'AC Sleeper (2+1)',
        seats: ['L5', 'L6'],
        passengers: [
          { name: 'Karthik Subramanian', age: 29, gender: 'Male', seatId: 'L5' },
          { name: 'Ananya Karthik', age: 26, gender: 'Female', seatId: 'L6' }
        ],
        contact: {
          maskedPhone: '+91 98••••••45',
          email: 'karthik.s@example.com',
          maskedAadhaar: 'XXXX-XXXX-8921'
        },
        baseFare: 1700,
        tax: 85,
        totalFare: 1785,
        status: 'CONFIRMED'
      }
    ]
  };

  // Station Code Map for Southern Cities
  const cityCodeMap = {
    'Chennai': 'MAA',
    'Coimbatore': 'CJB',
    'Madurai': 'IXM',
    'Tiruppur': 'TPR',
    'Salem': 'SLM',
    'Trichy': 'TRZ',
    'Erode': 'ED'
  };

  // Typical Boarding & Dropping Points
  const stationLocations = {
    'Chennai': {
      boarding: 'Koyambedu Omni Bus Stand, Platform 4',
      dropping: 'Perungalathur Junction'
    },
    'Coimbatore': {
      boarding: 'Gandhipuram Central Omni Bus Stand',
      dropping: 'Hopes College / Omni Bus Stand'
    },
    'Madurai': {
      boarding: 'Mattuthavani Integrated Bus Stand',
      dropping: 'Periyar Bus Stand'
    },
    'Tiruppur': {
      boarding: 'Old Bus Stand, Pushpa Theatre Corner',
      dropping: 'Avinashi Bypass Junction'
    },
    'Salem': {
      boarding: 'New Bus Stand, AVR Roundana',
      dropping: 'Seelanaickenpatti Bypass'
    },
    'Trichy': {
      boarding: 'Central Bus Stand, Rockfort Terminal',
      dropping: 'Tollgate Junction'
    },
    'Erode': {
      boarding: 'Erode Central Bus Stand',
      dropping: 'Perundurai Bypass'
    }
  };

  // Sample fleet template generator
  const busOperatorsFleet = [
    {
      name: 'KPN Travels',
      type: 'AC Sleeper (2+1)',
      category: 'AC Sleeper',
      rating: 4.8,
      reviewsCount: 342,
      basePrice: 850,
      amenities: ['WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Live Tracking'],
      depOffset: '21:30',
      durationHours: 7.5
    },
    {
      name: 'SRS Travels',
      type: 'AC Seater (2+2)',
      category: 'AC Seater',
      rating: 4.5,
      reviewsCount: 289,
      basePrice: 650,
      amenities: ['Charging Point', 'Water Bottle', 'Live Tracking'],
      depOffset: '06:30',
      durationHours: 7.0
    },
    {
      name: 'Parveen Travels',
      type: 'AC Sleeper (2+1)',
      category: 'AC Sleeper',
      rating: 4.9,
      reviewsCount: 512,
      basePrice: 950,
      amenities: ['WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'Live Tracking', 'Snacks'],
      depOffset: '22:15',
      durationHours: 7.25
    },
    {
      name: 'City Star Express',
      type: 'BharatBenz Super Luxury AC',
      category: 'Super Luxury',
      rating: 4.7,
      reviewsCount: 198,
      basePrice: 1050,
      amenities: ['WiFi', 'Individual TV', 'Blanket', 'USB Fast Charge', 'Live Tracking'],
      depOffset: '14:00',
      durationHours: 6.75
    },
    {
      name: 'SRM Transports',
      type: 'Non-AC Sleeper',
      category: 'Non-AC Sleeper',
      rating: 4.3,
      reviewsCount: 164,
      basePrice: 580,
      amenities: ['Charging Point', 'Reading Lamp', 'Water Bottle'],
      depOffset: '20:00',
      durationHours: 8.0
    },
    {
      name: 'Greenline Travels',
      type: 'AC Sleeper (2+1)',
      category: 'AC Sleeper',
      rating: 4.6,
      reviewsCount: 220,
      basePrice: 890,
      amenities: ['WiFi', 'Blanket', 'Water Bottle', 'Live Tracking'],
      depOffset: '23:30',
      durationHours: 7.5
    }
  ];

  // =========================================================================
  // DOM ELEMENT REFERENCES
  // =========================================================================
  const dom = {
    // Navigation
    logoBtn: document.getElementById('logoBtn'),
    navHomeBtn: document.getElementById('navHomeBtn'),
    navBookingsBtn: document.getElementById('navBookingsBtn'),
    navSafetyBtn: document.getElementById('navSafetyBtn'),
    bookingsCountBadge: document.getElementById('bookingsCountBadge'),
    safetyModal: document.getElementById('safetyModal'),
    closeSafetyModalBtn: document.getElementById('closeSafetyModalBtn'),
    gotItSafetyBtn: document.getElementById('gotItSafetyBtn'),

    // Stepper
    stepItems: document.querySelectorAll('.step-item'),
    stepLines: document.querySelectorAll('.step-line'),

    // Views
    viewStep1: document.getElementById('viewStep1'),
    viewStep2: document.getElementById('viewStep2'),
    viewStep3: document.getElementById('viewStep3'),
    viewStep4: document.getElementById('viewStep4'),
    viewStep5: document.getElementById('viewStep5'),
    viewStep6: document.getElementById('viewStep6'),
    viewMyBookings: document.getElementById('viewMyBookings'),

    // Step 1: Search Form
    searchForm: document.getElementById('searchForm'),
    fromCity: document.getElementById('fromCity'),
    toCity: document.getElementById('toCity'),
    journeyDate: document.getElementById('journeyDate'),
    swapCitiesBtn: document.getElementById('swapCitiesBtn'),
    fromCityError: document.getElementById('fromCityError'),
    toCityError: document.getElementById('toCityError'),
    journeyDateError: document.getElementById('journeyDateError'),
    quickTags: document.querySelectorAll('.quick-tag'),

    // Step 2: Bus List & Filters
    resFromCity: document.getElementById('resFromCity'),
    resToCity: document.getElementById('resToCity'),
    resJourneyDate: document.getElementById('resJourneyDate'),
    resBusCount: document.getElementById('resBusCount'),
    modifySearchBtn: document.getElementById('modifySearchBtn'),
    busesList: document.getElementById('busesList'),
    busTypeFilters: document.querySelectorAll('input[name="busTypeFilter"]'),
    priceRangeSlider: document.getElementById('priceRangeSlider'),
    priceRangeDisplay: document.getElementById('priceRangeDisplay'),
    sortBusesSelect: document.getElementById('sortBusesSelect'),
    timeChips: document.querySelectorAll('.time-chip'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),

    // Step 3: Seat Selection
    selectedBusMiniBanner: document.getElementById('selectedBusMiniBanner'),
    lowerDeckTabBtn: document.getElementById('lowerDeckTabBtn'),
    upperDeckTabBtn: document.getElementById('upperDeckTabBtn'),
    lowerDeckContainer: document.getElementById('lowerDeckContainer'),
    upperDeckContainer: document.getElementById('upperDeckContainer'),
    lowerDeckSeatsGrid: document.getElementById('lowerDeckSeatsGrid'),
    upperDeckSeatsGrid: document.getElementById('upperDeckSeatsGrid'),
    selectedSeatsPills: document.getElementById('selectedSeatsPills'),
    seatCountText: document.getElementById('seatCountText'),
    baseFareAmount: document.getElementById('baseFareAmount'),
    taxAmount: document.getElementById('taxAmount'),
    totalFareAmount: document.getElementById('totalFareAmount'),
    proceedToPassengerBtn: document.getElementById('proceedToPassengerBtn'),
    backToBusesBtn: document.getElementById('backToBusesBtn'),

    // Step 4: Passenger Details
    passengerDetailsForm: document.getElementById('passengerDetailsForm'),
    dynamicPassengerCards: document.getElementById('dynamicPassengerCards'),
    contactPhone: document.getElementById('contactPhone'),
    contactEmail: document.getElementById('contactEmail'),
    contactAadhaar: document.getElementById('contactAadhaar'),
    contactPhoneError: document.getElementById('contactPhoneError'),
    contactEmailError: document.getElementById('contactEmailError'),
    contactAadhaarError: document.getElementById('contactAadhaarError'),
    passengerTripSummary: document.getElementById('passengerTripSummary'),
    backToSeatsBtn: document.getElementById('backToSeatsBtn'),

    // Step 5: Review & Confirm
    revBusName: document.getElementById('revBusName'),
    revBusType: document.getElementById('revBusType'),
    revDepTime: document.getElementById('revDepTime'),
    revArrTime: document.getElementById('revArrTime'),
    revFromCity: document.getElementById('revFromCity'),
    revToCity: document.getElementById('revToCity'),
    revBoardingPoint: document.getElementById('revBoardingPoint'),
    revDroppingPoint: document.getElementById('revDroppingPoint'),
    revDuration: document.getElementById('revDuration'),
    revJourneyDate: document.getElementById('revJourneyDate'),
    revPassengerCount: document.getElementById('revPassengerCount'),
    revPassengersTableBody: document.getElementById('revPassengersTableBody'),
    revMaskedPhone: document.getElementById('revMaskedPhone'),
    revMaskedEmail: document.getElementById('revMaskedEmail'),
    revMaskedAadhaar: document.getElementById('revMaskedAadhaar'),
    revSeatsList: document.getElementById('revSeatsList'),
    revBaseFare: document.getElementById('revBaseFare'),
    revTax: document.getElementById('revTax'),
    revGrandTotal: document.getElementById('revGrandTotal'),
    agreeTermsCheck: document.getElementById('agreeTermsCheck'),
    confirmBookingBtn: document.getElementById('confirmBookingBtn'),
    editDetailsBtn: document.getElementById('editDetailsBtn'),

    // Step 6: Confirmation, Ticket & SMS
    successPnrDisplay: document.getElementById('successPnrDisplay'),
    printTicketBtn: document.getElementById('printTicketBtn'),
    viewInMyBookingsBtn: document.getElementById('viewInMyBookingsBtn'),
    bookNewJourneyBtn: document.getElementById('bookNewJourneyBtn'),
    
    // Printable Ticket fields
    tktPnr: document.getElementById('tktPnr'),
    tktFromCode: document.getElementById('tktFromCode'),
    tktToCode: document.getElementById('tktToCode'),
    tktFromCity: document.getElementById('tktFromCity'),
    tktToCity: document.getElementById('tktToCity'),
    tktDepTime: document.getElementById('tktDepTime'),
    tktArrTime: document.getElementById('tktArrTime'),
    tktBoarding: document.getElementById('tktBoarding'),
    tktDropping: document.getElementById('tktDropping'),
    tktDuration: document.getElementById('tktDuration'),
    tktDate: document.getElementById('tktDate'),
    tktBusName: document.getElementById('tktBusName'),
    tktBusType: document.getElementById('tktBusType'),
    tktSeats: document.getElementById('tktSeats'),
    tktReportTime: document.getElementById('tktReportTime'),
    tktManifestTableBody: document.getElementById('tktManifestTableBody'),
    tktAadhaarMasked: document.getElementById('tktAadhaarMasked'),
    tktPhoneMasked: document.getElementById('tktPhoneMasked'),
    tktTotalPaid: document.getElementById('tktTotalPaid'),
    tktBarcodeNum: document.getElementById('tktBarcodeNum'),

    // SMS Preview
    phoneClock: document.getElementById('phoneClock'),
    smsTimestamp: document.getElementById('smsTimestamp'),
    smsMessageBody: document.getElementById('smsMessageBody'),
    smsTargetPhone: document.getElementById('smsTargetPhone'),

    // My Bookings View
    bookingsListContainer: document.getElementById('bookingsListContainer'),
    myBookingsBackBtn: document.getElementById('myBookingsBackBtn'),

    // Toasts
    toastContainer: document.getElementById('toastContainer')
  };

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  async function initApp() {
    setupDatePickers();
    bindEvents();
    await syncBookingsWithBackend();
    updateBookingsCountBadge();
    showStep(1);
  }

  async function syncBookingsWithBackend() {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          state.bookings = json.data;
        }
      }
    } catch (err) {
      console.info('Backend not reachable yet, operating with local state.');
    }
  }

  // Setup Journey Date input to prevent selecting past dates
  function setupDatePickers() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDateStr = `${yyyy}-${mm}-${dd}`;

    dom.journeyDate.min = minDateStr;

    // Default to tomorrow for optimal convenience
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tmY = tomorrow.getFullYear();
    const tmM = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tmD = String(tomorrow.getDate()).padStart(2, '0');
    dom.journeyDate.value = `${tmY}-${tmM}-${tmD}`;
  }

  // =========================================================================
  // TOAST NOTIFICATION UTILITY
  // =========================================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3500);
  }

  // =========================================================================
  // STEPPER & VIEW NAVIGATION
  // =========================================================================
  function showStep(stepNumber) {
    state.currentStep = stepNumber;

    // Toggle views
    const allViews = [
      dom.viewStep1,
      dom.viewStep2,
      dom.viewStep3,
      dom.viewStep4,
      dom.viewStep5,
      dom.viewStep6,
      dom.viewMyBookings
    ];

    allViews.forEach(v => {
      if (v) v.classList.remove('active');
    });

    if (stepNumber >= 1 && stepNumber <= 6) {
      const activeView = document.getElementById(`viewStep${stepNumber}`);
      if (activeView) activeView.classList.add('active');
      dom.navHomeBtn.classList.add('active');
      dom.navBookingsBtn.classList.remove('active');
    } else if (stepNumber === 'bookings') {
      dom.viewMyBookings.classList.add('active');
      dom.navHomeBtn.classList.remove('active');
      dom.navBookingsBtn.classList.add('active');
    }

    // Update stepper progress indicators
    if (typeof stepNumber === 'number') {
      dom.stepItems.forEach(item => {
        const step = parseInt(item.getAttribute('data-step'), 10);
        item.classList.remove('active', 'completed');
        if (step === stepNumber) {
          item.classList.add('active');
        } else if (step < stepNumber) {
          item.classList.add('completed');
        }
      });

      // Update lines between steps
      dom.stepLines.forEach((line, index) => {
        const stepBefore = index + 1;
        if (stepNumber > stepBefore) {
          line.classList.add('completed');
        } else {
          line.classList.remove('completed');
        }
      });
    }

    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // STEP 1: SEARCH & VALIDATION
  // =========================================================================
  async function handleSearchSubmit(e) {
    e.preventDefault();
    clearSearchErrors();

    const fromVal = dom.fromCity.value.trim();
    const toVal = dom.toCity.value.trim();
    const dateVal = dom.journeyDate.value;

    let hasError = false;

    if (!fromVal) {
      dom.fromCityError.textContent = 'Please select a departure city';
      dom.fromCity.classList.add('is-invalid');
      hasError = true;
    }

    if (!toVal) {
      dom.toCityError.textContent = 'Please select a destination city';
      dom.toCity.classList.add('is-invalid');
      hasError = true;
    }

    if (fromVal && toVal && fromVal === toVal) {
      dom.toCityError.textContent = 'Destination cannot be the same as origin';
      dom.toCity.classList.add('is-invalid');
      hasError = true;
    }

    if (!dateVal) {
      dom.journeyDateError.textContent = 'Please select your journey date';
      dom.journeyDate.classList.add('is-invalid');
      hasError = true;
    } else {
      const selected = new Date(dateVal);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        dom.journeyDateError.textContent = 'Journey date cannot be in the past';
        dom.journeyDate.classList.add('is-invalid');
        hasError = true;
      }
    }

    if (hasError) return;

    // Save search state
    state.searchParams = {
      from: fromVal,
      to: toVal,
      date: dateVal
    };

    // Attempt live search from backend database
    try {
      const res = await fetch(`${API_BASE_URL}/buses/search?from=${encodeURIComponent(fromVal)}&to=${encodeURIComponent(toVal)}&date=${encodeURIComponent(dateVal)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          state.availableBuses = json.data;
          dom.resFromCity.textContent = fromVal;
          dom.resToCity.textContent = toVal;
          dom.resJourneyDate.textContent = formatDisplayDate(dateVal);
          renderBusesList();
          showStep(2);
          showToast(`Found ${state.availableBuses.length} express buses for ${fromVal} to ${toVal}`, 'success');
          return;
        }
      }
    } catch (apiErr) {
      console.warn('Backend live search unavailable, falling back to local simulation:', apiErr);
    }

    // Fallback: Generate buses for this route
    generateBusesForRoute(fromVal, toVal, dateVal);

    // Show Step 2
    showStep(2);
    showToast(`Found ${state.availableBuses.length} express buses for ${fromVal} to ${toVal}`, 'success');
  }

  function clearSearchErrors() {
    dom.fromCityError.textContent = '';
    dom.toCityError.textContent = '';
    dom.journeyDateError.textContent = '';
    dom.fromCity.classList.remove('is-invalid');
    dom.toCity.classList.remove('is-invalid');
    dom.journeyDate.classList.remove('is-invalid');
  }

  function swapCities() {
    const temp = dom.fromCity.value;
    dom.fromCity.value = dom.toCity.value;
    dom.toCity.value = temp;
    clearSearchErrors();
  }

  function handleQuickTag(e) {
    const from = e.currentTarget.getAttribute('data-from');
    const to = e.currentTarget.getAttribute('data-to');
    dom.fromCity.value = from;
    dom.toCity.value = to;
    clearSearchErrors();
  }

  // =========================================================================
  // STEP 2: AVAILABLE BUSES GENERATOR & FILTERS
  // =========================================================================
  function generateBusesForRoute(from, to, date) {
    const formattedDate = formatDisplayDate(date);
    dom.resFromCity.textContent = from;
    dom.resToCity.textContent = to;
    dom.resJourneyDate.textContent = formattedDate;

    const fromLoc = stationLocations[from] ? stationLocations[from].boarding : `${from} Central`;
    const toLoc = stationLocations[to] ? stationLocations[to].dropping : `${to} Bypass`;

    // Estimate base distance / duration between cities
    let routeHours = 7.5;
    if ((from === 'Chennai' && to === 'Salem') || (from === 'Salem' && to === 'Chennai')) routeHours = 5.5;
    if ((from === 'Chennai' && to === 'Madurai') || (from === 'Madurai' && to === 'Chennai')) routeHours = 8.0;
    if ((from === 'Coimbatore' && to === 'Madurai') || (from === 'Madurai' && to === 'Coimbatore')) routeHours = 4.5;
    if ((from === 'Tiruppur' && to === 'Chennai') || (from === 'Chennai' && to === 'Tiruppur')) routeHours = 7.0;

    // Generate list of buses with realistic timings
    state.availableBuses = busOperatorsFleet.map((template, idx) => {
      const departureHour = parseInt(template.depOffset.split(':')[0], 10);
      const departureMin = parseInt(template.depOffset.split(':')[1], 10);

      // Calculate arrival
      const arrTotalMin = (departureHour * 60 + departureMin + Math.round(routeHours * 60)) % (24 * 60);
      const arrHour = Math.floor(arrTotalMin / 60);
      const arrMin = arrTotalMin % 60;
      const arrivalTime = `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`;

      // Calculate duration string
      const durH = Math.floor(routeHours);
      const durM = Math.round((routeHours - durH) * 60);
      const durationStr = `${durH}h ${durM > 0 ? durM + 'm' : '00m'}`;

      // Realistic available seats count
      const availableSeatsCount = 14 + ((idx * 3) % 15);

      return {
        id: `BUS-${idx + 101}`,
        name: template.name,
        type: template.type,
        category: template.category,
        rating: template.rating,
        reviewsCount: template.reviewsCount,
        depTime: template.depOffset,
        arrTime: arrivalTime,
        duration: durationStr,
        price: template.basePrice,
        availableSeatsCount: availableSeatsCount,
        amenities: template.amenities,
        boardingPoint: fromLoc,
        droppingPoint: toLoc
      };
    });

    renderBusesList();
  }

  function renderBusesList() {
    const filtered = getFilteredAndSortedBuses();
    dom.resBusCount.textContent = `${filtered.length} buses found`;
    dom.busesList.innerHTML = '';

    if (filtered.length === 0) {
      dom.busesList.innerHTML = `
        <div class="no-buses-found">
          <div class="no-buses-icon">🚌</div>
          <h3>No Buses Matching Your Filters</h3>
          <p class="text-muted">Try adjusting your bus type, price range, or departure times.</p>
          <button type="button" class="btn btn-primary btn-sm" id="emptyStateResetBtn" style="margin-top: 1rem;">
            Reset All Filters
          </button>
        </div>
      `;
      const btn = document.getElementById('emptyStateResetBtn');
      if (btn) btn.addEventListener('click', resetFilters);
      return;
    }

    filtered.forEach(bus => {
      const card = document.createElement('div');
      card.className = 'bus-card';
      card.innerHTML = `
        <div class="bus-card-top">
          <div class="bus-operator-info">
            <span class="bus-operator-name">${escapeHtml(bus.name)}</span>
            <span class="bus-type-badge">${escapeHtml(bus.type)}</span>
          </div>
          <div class="bus-rating-pill">
            <span>★</span>
            <span>${bus.rating.toFixed(1)}</span>
            <span style="opacity: 0.6; font-size: 0.7rem;">(${bus.reviewsCount})</span>
          </div>
        </div>

        <div class="bus-journey-row">
          <div class="journey-node">
            <span class="node-time">${bus.depTime}</span>
            <span class="node-location">${state.searchParams.from}</span>
            <span class="node-stop-point">${escapeHtml(bus.boardingPoint)}</span>
          </div>

          <div class="journey-path-col">
            <span class="duration-text">${bus.duration}</span>
            <div class="path-graphic">
              <span class="path-circle"></span>
              <span class="path-bar"></span>
              <span class="path-bus-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="15" rx="3"></rect>
                  <path d="M3 10h18"></path>
                </svg>
              </span>
              <span class="path-bar"></span>
              <span class="path-circle"></span>
            </div>
          </div>

          <div class="journey-node">
            <span class="node-time">${bus.arrTime}</span>
            <span class="node-location">${state.searchParams.to}</span>
            <span class="node-stop-point">${escapeHtml(bus.droppingPoint)}</span>
          </div>

          <div class="bus-fare-col">
            <span class="fare-tag">Starts from</span>
            <span class="fare-price">₹${bus.price.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="bus-card-bottom">
          <div class="amenities-list">
            ${bus.amenities.map(a => `<span class="amenity-chip">${escapeHtml(a)}</span>`).join('')}
          </div>
          <div class="card-action-side">
            <span class="seats-left-pill ${bus.availableSeatsCount <= 15 ? 'low' : ''}">
              ${bus.availableSeatsCount} Seats Left
            </span>
            <button type="button" class="btn btn-primary select-bus-btn" data-bus-id="${bus.id}">
              <span>Select Bus</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      `;

      dom.busesList.appendChild(card);
    });

    // Attach click handlers to Select Bus buttons
    document.querySelectorAll('.select-bus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const busId = btn.getAttribute('data-bus-id');
        selectBus(busId);
      });
    });
  }

  function getFilteredAndSortedBuses() {
    let list = [...state.availableBuses];

    // Bus Type Filter
    const selectedTypes = Array.from(dom.busTypeFilters)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    if (!selectedTypes.includes('ALL') && selectedTypes.length > 0) {
      list = list.filter(b => selectedTypes.includes(b.category));
    }

    // Price Filter
    const maxPrice = parseInt(dom.priceRangeSlider.value, 10);
    list = list.filter(b => b.price <= maxPrice);

    // Departure Time Filter
    if (state.filterOptions.departureTime) {
      list = list.filter(b => {
        const hour = parseInt(b.depTime.split(':')[0], 10);
        if (state.filterOptions.departureTime === 'morning') return hour >= 6 && hour < 12;
        if (state.filterOptions.departureTime === 'afternoon') return hour >= 12 && hour < 18;
        if (state.filterOptions.departureTime === 'evening') return hour >= 18 && hour < 23;
        if (state.filterOptions.departureTime === 'night') return hour >= 23 || hour < 6;
        return true;
      });
    }

    // Sort
    const sortVal = dom.sortBusesSelect.value;
    list.sort((a, b) => {
      if (sortVal === 'departure_asc') return a.depTime.localeCompare(b.depTime);
      if (sortVal === 'departure_desc') return b.depTime.localeCompare(a.depTime);
      if (sortVal === 'price_asc') return a.price - b.price;
      if (sortVal === 'price_desc') return b.price - a.price;
      if (sortVal === 'rating_desc') return b.rating - a.rating;
      return 0;
    });

    return list;
  }

  function resetFilters() {
    dom.busTypeFilters.forEach(cb => cb.checked = (cb.value === 'ALL'));
    dom.priceRangeSlider.value = 1500;
    dom.priceRangeDisplay.textContent = '₹1500';
    dom.sortBusesSelect.value = 'departure_asc';
    state.filterOptions.departureTime = null;
    dom.timeChips.forEach(c => c.classList.remove('active'));
    renderBusesList();
  }

  // =========================================================================
  // STEP 3: INTERACTIVE SEAT SELECTION & LAYOUT
  // =========================================================================
  async function selectBus(busId) {
    const bus = state.availableBuses.find(b => b.id === busId);
    if (!bus) return;

    state.selectedBus = bus;
    state.selectedSeats = []; // Reset selected seats

    // Render Mini banner at the top of Step 3
    dom.selectedBusMiniBanner.innerHTML = `
      <div>
        <div class="mini-bus-name">${escapeHtml(bus.name)} <span class="bus-type-badge">${escapeHtml(bus.type)}</span></div>
        <div class="mini-trip-details">
          <span>${state.searchParams.from} ➔ ${state.searchParams.to}</span>
          <span>•</span>
          <span>Departure: <strong>${bus.depTime}</strong></span>
          <span>•</span>
          <span>Journey Date: <strong>${formatDisplayDate(state.searchParams.date)}</strong></span>
        </div>
      </div>
      <button type="button" class="btn btn-outline btn-sm" id="changeBusMiniBtn">Change Bus</button>
    `;

    document.getElementById('changeBusMiniBtn').addEventListener('click', () => {
      showStep(2);
    });

    // Attempt live seat map from backend database
    try {
      const res = await fetch(`${API_BASE_URL}/buses/${encodeURIComponent(bus.id)}/seats?date=${encodeURIComponent(state.searchParams.date)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.seats) {
          state.busSeats = json.data.seats;
          renderDeckSeats();
          updateSeatsSummary();
          showStep(3);
          return;
        }
      }
    } catch (apiErr) {
      console.warn('Backend live seat map unavailable, using local generator:', apiErr);
    }

    // Fallback: Generate seats for Lower and Upper Decks
    generateDeckSeats(bus);

    // Render seats
    renderDeckSeats();
    updateSeatsSummary();

    showStep(3);
  }

  function generateDeckSeats(bus) {
    // Lower Deck: 18 seats (mixture of seater and sleeper berths)
    const lower = [];
    const isSleeper = bus.type.includes('Sleeper');

    // 6 rows, 3 columns (Left 1, Aisle, Right 2) or (Left 2, Aisle, Right 2)
    let seatIndex = 1;
    for (let r = 1; r <= 6; r++) {
      // Column 1 (Left Window)
      const seatId = `L${seatIndex++}`;
      const isBooked = (seatIndex % 4 === 0);
      const isLadies = (seatIndex === 7 || seatIndex === 11);

      lower.push({
        id: seatId,
        deck: 'lower',
        row: r,
        col: 1,
        type: isSleeper ? 'sleeper' : 'seater',
        status: isBooked ? 'booked' : (isLadies ? 'ladies' : 'available'),
        price: bus.price
      });

      // Column 2 (Right Inner)
      const seatId2 = `L${seatIndex++}`;
      const isBooked2 = (seatIndex % 5 === 0);
      lower.push({
        id: seatId2,
        deck: 'lower',
        row: r,
        col: 2,
        type: isSleeper ? 'sleeper' : 'seater',
        status: isBooked2 ? 'booked' : 'available',
        price: bus.price
      });

      // Column 3 (Right Window)
      const seatId3 = `L${seatIndex++}`;
      const isBooked3 = (seatIndex === 3 || seatIndex === 15);
      lower.push({
        id: seatId3,
        deck: 'lower',
        row: r,
        col: 3,
        type: isSleeper ? 'sleeper' : 'seater',
        status: isBooked3 ? 'booked' : 'available',
        price: bus.price
      });
    }

    // Upper Deck: 12 Sleeper berths
    const upper = [];
    let upperIndex = 1;
    for (let r = 1; r <= 6; r++) {
      // Left Berth
      const uSeat1 = `U${upperIndex++}`;
      const isBookedU1 = (upperIndex % 3 === 0);
      upper.push({
        id: uSeat1,
        deck: 'upper',
        row: r,
        col: 1,
        type: 'sleeper',
        status: isBookedU1 ? 'booked' : 'available',
        price: bus.price + 100 // Sleeper premium
      });

      // Right Berth
      const uSeat2 = `U${upperIndex++}`;
      const isBookedU2 = (upperIndex === 5 || upperIndex === 9);
      upper.push({
        id: uSeat2,
        deck: 'upper',
        row: r,
        col: 2,
        type: 'sleeper',
        status: isBookedU2 ? 'booked' : 'available',
        price: bus.price + 100
      });
    }

    state.busSeats.lower = lower;
    state.busSeats.upper = upper;
  }

  function renderDeckSeats() {
    // Render Lower Deck
    dom.lowerDeckSeatsGrid.innerHTML = '';
    const lowerRowsMap = groupBy(state.busSeats.lower, 'row');

    Object.keys(lowerRowsMap).forEach(rowNum => {
      const seatsInRow = lowerRowsMap[rowNum];
      const rowEl = document.createElement('div');
      rowEl.className = 'seat-row';

      // Left group (Col 1)
      const leftGroup = document.createElement('div');
      leftGroup.className = 'seat-group';
      const seatLeft = seatsInRow.find(s => s.col === 1);
      if (seatLeft) leftGroup.appendChild(createSeatElement(seatLeft));

      // Aisle
      const aisle = document.createElement('div');
      aisle.className = 'aisle-space';
      aisle.textContent = 'AISLE';

      // Right group (Col 2, 3)
      const rightGroup = document.createElement('div');
      rightGroup.className = 'seat-group';
      const seatRight1 = seatsInRow.find(s => s.col === 2);
      const seatRight2 = seatsInRow.find(s => s.col === 3);
      if (seatRight1) rightGroup.appendChild(createSeatElement(seatRight1));
      if (seatRight2) rightGroup.appendChild(createSeatElement(seatRight2));

      rowEl.appendChild(leftGroup);
      rowEl.appendChild(aisle);
      rowEl.appendChild(rightGroup);

      dom.lowerDeckSeatsGrid.appendChild(rowEl);
    });

    // Render Upper Deck
    dom.upperDeckSeatsGrid.innerHTML = '';
    const upperRowsMap = groupBy(state.busSeats.upper, 'row');

    Object.keys(upperRowsMap).forEach(rowNum => {
      const seatsInRow = upperRowsMap[rowNum];
      const rowEl = document.createElement('div');
      rowEl.className = 'seat-row';

      // Left group (Col 1)
      const leftGroup = document.createElement('div');
      leftGroup.className = 'seat-group';
      const seatLeft = seatsInRow.find(s => s.col === 1);
      if (seatLeft) leftGroup.appendChild(createSeatElement(seatLeft));

      // Aisle
      const aisle = document.createElement('div');
      aisle.className = 'aisle-space';
      aisle.textContent = 'AISLE';

      // Right group (Col 2)
      const rightGroup = document.createElement('div');
      rightGroup.className = 'seat-group';
      const seatRight = seatsInRow.find(s => s.col === 2);
      if (seatRight) rightGroup.appendChild(createSeatElement(seatRight));

      rowEl.appendChild(leftGroup);
      rowEl.appendChild(aisle);
      rowEl.appendChild(rightGroup);

      dom.upperDeckSeatsGrid.appendChild(rowEl);
    });
  }

  function createSeatElement(seat) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `bus-seat ${seat.type === 'sleeper' ? 'sleeper-berth' : ''}`;
    el.setAttribute('data-seat-id', seat.id);
    el.setAttribute('data-deck', seat.deck);
    el.title = `Seat ${seat.id} (₹${seat.price})`;

    if (seat.status === 'booked') {
      el.classList.add('booked');
      el.disabled = true;
      el.title = `Seat ${seat.id} - Booked`;
    } else if (seat.status === 'ladies') {
      el.classList.add('ladies-booked');
      el.disabled = true;
      el.title = `Seat ${seat.id} - Reserved for Ladies`;
    }

    const isSelected = state.selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      el.classList.add('selected');
    }

    el.innerHTML = `<span>${seat.id}</span>`;

    if (seat.status === 'available') {
      el.addEventListener('click', () => toggleSeatSelection(seat));
    }

    return el;
  }

  function toggleSeatSelection(seat) {
    const existingIndex = state.selectedSeats.findIndex(s => s.id === seat.id);

    if (existingIndex >= 0) {
      // Remove
      state.selectedSeats.splice(existingIndex, 1);
    } else {
      // Limit to 6 seats per booking for safety/sanity
      if (state.selectedSeats.length >= 6) {
        showToast('Maximum of 6 seats can be selected per transaction.', 'error');
        return;
      }
      state.selectedSeats.push(seat);
    }

    // Refresh seat classes on both grids
    document.querySelectorAll('.bus-seat').forEach(el => {
      const sId = el.getAttribute('data-seat-id');
      if (state.selectedSeats.some(s => s.id === sId)) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });

    updateSeatsSummary();
  }

  function updateSeatsSummary() {
    const count = state.selectedSeats.length;
    dom.seatCountText.textContent = `${count} seat${count === 1 ? '' : 's'}`;

    if (count === 0) {
      dom.selectedSeatsPills.innerHTML = '<span class="no-seats-text">No seats selected yet. Click any available seat on the coach.</span>';
      dom.baseFareAmount.textContent = '₹0';
      dom.taxAmount.textContent = '₹0';
      dom.totalFareAmount.textContent = '₹0';
      dom.proceedToPassengerBtn.disabled = true;
      return;
    }

    // Render Pills
    dom.selectedSeatsPills.innerHTML = '';
    state.selectedSeats.forEach(seat => {
      const pill = document.createElement('span');
      pill.className = 'seat-pill';
      pill.innerHTML = `
        <span>${seat.id} (₹${seat.price})</span>
        <button type="button" class="seat-pill-remove" title="Deselect seat">&times;</button>
      `;
      pill.querySelector('.seat-pill-remove').addEventListener('click', () => {
        toggleSeatSelection(seat);
      });
      dom.selectedSeatsPills.appendChild(pill);
    });

    // Calculate Fares
    const baseTotal = state.selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const tax = Math.round(baseTotal * 0.05); // 5% GST
    const grandTotal = baseTotal + tax;

    dom.baseFareAmount.textContent = `₹${baseTotal.toLocaleString('en-IN')}`;
    dom.taxAmount.textContent = `₹${tax.toLocaleString('en-IN')}`;
    dom.totalFareAmount.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

    dom.proceedToPassengerBtn.disabled = false;
  }

  // =========================================================================
  // STEP 4: PASSENGER DETAILS FORM & VALIDATION
  // =========================================================================
  function setupPassengerForm() {
    dom.dynamicPassengerCards.innerHTML = '';

    // Generate dynamic card for each selected seat
    state.selectedSeats.forEach((seat, index) => {
      const card = document.createElement('div');
      card.className = 'passenger-single-card';
      card.innerHTML = `
        <div class="passenger-card-head">
          <div class="passenger-number-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Passenger ${index + 1}</span>
          </div>
          <span class="seat-tag-bubble">Seat ${seat.id} (${seat.deck.toUpperCase()} DECK)</span>
        </div>

        <div class="passenger-fields-grid">
          <!-- Full Name -->
          <div class="form-group">
            <label class="form-label" for="pName_${seat.id}">
              <span>Full Name</span>
              <span class="required-star">*</span>
            </label>
            <input 
              type="text" 
              id="pName_${seat.id}" 
              name="passengerName_${seat.id}" 
              class="form-input passenger-name-input" 
              placeholder="e.g. Kishore Kumar" 
              required
            >
            <span class="field-error" id="pNameError_${seat.id}"></span>
          </div>

          <!-- Age -->
          <div class="form-group">
            <label class="form-label" for="pAge_${seat.id}">
              <span>Age</span>
              <span class="required-star">*</span>
            </label>
            <input 
              type="number" 
              id="pAge_${seat.id}" 
              name="passengerAge_${seat.id}" 
              class="form-input passenger-age-input" 
              placeholder="28" 
              min="1" 
              max="120" 
              required
            >
            <span class="field-error" id="pAgeError_${seat.id}"></span>
          </div>

          <!-- Gender -->
          <div class="form-group">
            <label class="form-label" for="pGender_${seat.id}">
              <span>Gender</span>
              <span class="required-star">*</span>
            </label>
            <select id="pGender_${seat.id}" name="passengerGender_${seat.id}" class="form-select passenger-gender-select" required>
              <option value="" disabled selected>Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <span class="field-error" id="pGenderError_${seat.id}"></span>
          </div>
        </div>
      `;
      dom.dynamicPassengerCards.appendChild(card);
    });

    // Populate Sidebar Summary for Step 4
    const baseTotal = state.selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const tax = Math.round(baseTotal * 0.05);
    const grandTotal = baseTotal + tax;

    dom.passengerTripSummary.innerHTML = `
      <h3 class="card-title">Journey Overview</h3>
      <div style="margin-bottom: 1rem;">
        <div style="font-weight: 800; font-size: 1.1rem;">${escapeHtml(state.selectedBus.name)}</div>
        <div style="font-size: 0.8rem; color: var(--primary); font-weight: 700;">${escapeHtml(state.selectedBus.type)}</div>
      </div>
      <div class="fare-calculation">
        <div class="fare-row">
          <span>Route:</span>
          <strong>${state.searchParams.from} ➔ ${state.searchParams.to}</strong>
        </div>
        <div class="fare-row">
          <span>Date:</span>
          <span>${formatDisplayDate(state.searchParams.date)}</span>
        </div>
        <div class="fare-row">
          <span>Departure:</span>
          <span>${state.selectedBus.depTime}</span>
        </div>
        <div class="fare-row">
          <span>Seats (${state.selectedSeats.length}):</span>
          <strong>${state.selectedSeats.map(s => s.id).join(', ')}</strong>
        </div>
        <div class="summary-divider"></div>
        <div class="fare-row total-row">
          <span>Total Fare:</span>
          <span class="total-price">₹${grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>
    `;

    // Real-time Aadhaar input formatter (e.g. 1234 5678 9012)
    dom.contactAadhaar.addEventListener('input', formatAadhaarInput);
  }

  function formatAadhaarInput(e) {
    let val = e.target.value.replace(/\D/g, ''); // strip non-digits
    if (val.length > 12) val = val.substring(0, 12);
    // add space after every 4 digits
    let formatted = '';
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += val[i];
    }
    e.target.value = formatted;
  }

  function handlePassengerSubmit(e) {
    e.preventDefault();
    clearPassengerErrors();

    let hasError = false;
    const passengerData = [];

    // Validate each passenger card
    state.selectedSeats.forEach(seat => {
      const nameInput = document.getElementById(`pName_${seat.id}`);
      const ageInput = document.getElementById(`pAge_${seat.id}`);
      const genderSelect = document.getElementById(`pGender_${seat.id}`);
      const nameError = document.getElementById(`pNameError_${seat.id}`);
      const ageError = document.getElementById(`pAgeError_${seat.id}`);
      const genderError = document.getElementById(`pGenderError_${seat.id}`);

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const ageVal = ageInput ? parseInt(ageInput.value, 10) : NaN;
      const genderVal = genderSelect ? genderSelect.value : '';

      // Validate name (min 2 chars, letters and spaces only)
      if (!nameVal || nameVal.length < 2 || !/^[a-zA-Z\s.]+$/.test(nameVal)) {
        nameError.textContent = 'Please enter a valid passenger name (letters only)';
        nameInput.classList.add('is-invalid');
        hasError = true;
      }

      // Validate age (5 to 120)
      if (isNaN(ageVal) || ageVal < 1 || ageVal > 120) {
        ageError.textContent = 'Valid age (1 - 120)';
        ageInput.classList.add('is-invalid');
        hasError = true;
      }

      // Validate gender
      if (!genderVal) {
        genderError.textContent = 'Select gender';
        genderSelect.classList.add('is-invalid');
        hasError = true;
      }

      passengerData.push({
        name: nameVal,
        age: ageVal,
        gender: genderVal,
        seatId: seat.id
      });
    });

    // Validate Phone: Indian mobile (10 digits starting with 6-9)
    const phoneVal = dom.contactPhone.value.trim().replace(/\D/g, '');
    if (!phoneVal || !/^[6-9]\d{9}$/.test(phoneVal)) {
      dom.contactPhoneError.textContent = 'Enter valid 10-digit Indian mobile number (e.g., 9876543210)';
      dom.contactPhone.classList.add('is-invalid');
      hasError = true;
    }

    // Validate Email
    const emailVal = dom.contactEmail.value.trim();
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      dom.contactEmailError.textContent = 'Please enter a valid email address';
      dom.contactEmail.classList.add('is-invalid');
      hasError = true;
    }

    // Validate Aadhaar (12 digits)
    const aadhaarRaw = dom.contactAadhaar.value.trim().replace(/\D/g, '');
    if (!aadhaarRaw || aadhaarRaw.length !== 12) {
      dom.contactAadhaarError.textContent = 'Enter a valid 12-digit Aadhaar number';
      dom.contactAadhaar.classList.add('is-invalid');
      hasError = true;
    }

    if (hasError) {
      showToast('Please fix the errors in the passenger and verification form.', 'error');
      return;
    }

    // Save state
    state.passengers = passengerData;
    state.contactInfo = {
      phone: phoneVal,
      email: emailVal,
      aadhaar: aadhaarRaw,
      maskedPhone: maskPhone(phoneVal),
      maskedAadhaar: maskAadhaar(aadhaarRaw)
    };

    // Populate Review Screen (Step 5)
    populateReviewScreen();
    showStep(5);
  }

  function clearPassengerErrors() {
    document.querySelectorAll('.passenger-single-card .field-error').forEach(e => e.textContent = '');
    document.querySelectorAll('.passenger-single-card .form-input, .passenger-single-card .form-select')
      .forEach(i => i.classList.remove('is-invalid'));

    dom.contactPhoneError.textContent = '';
    dom.contactEmailError.textContent = '';
    dom.contactAadhaarError.textContent = '';
    dom.contactPhone.classList.remove('is-invalid');
    dom.contactEmail.classList.remove('is-invalid');
    dom.contactAadhaar.classList.remove('is-invalid');
  }

  function maskPhone(phone) {
    if (!phone || phone.length < 4) return phone;
    // format: +91 98••••••10
    const start = phone.substring(0, 2);
    const end = phone.substring(phone.length - 2);
    return `+91 ${start}••••••${end}`;
  }

  function maskAadhaar(aadhaar) {
    if (!aadhaar || aadhaar.length < 4) return aadhaar;
    // format: XXXX-XXXX-1234
    const last4 = aadhaar.substring(aadhaar.length - 4);
    return `XXXX-XXXX-${last4}`;
  }

  function maskEmail(email) {
    if (!email || !email.includes('@')) return email;
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name[0]}•••@${domain}`;
    return `${name[0]}••••••${name[name.length - 1]}@${domain}`;
  }

  // =========================================================================
  // STEP 5: REVIEW AND CONFIRM
  // =========================================================================
  function populateReviewScreen() {
    const bus = state.selectedBus;
    dom.revBusName.textContent = bus.name;
    dom.revBusType.textContent = bus.type;
    dom.revDepTime.textContent = bus.depTime;
    dom.revArrTime.textContent = bus.arrTime;
    dom.revFromCity.textContent = state.searchParams.from;
    dom.revToCity.textContent = state.searchParams.to;
    dom.revBoardingPoint.textContent = bus.boardingPoint;
    dom.revDroppingPoint.textContent = bus.droppingPoint;
    dom.revDuration.textContent = bus.duration;
    dom.revJourneyDate.textContent = formatDisplayDate(state.searchParams.date);

    dom.revPassengerCount.textContent = `${state.passengers.length} Passenger${state.passengers.length === 1 ? '' : 's'}`;

    // Passengers Table
    dom.revPassengersTableBody.innerHTML = '';
    state.passengers.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>#${idx + 1}</strong></td>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td>${p.age} yrs</td>
        <td>${p.gender}</td>
        <td><span class="seat-tag-bubble" style="font-size: 0.75rem;">${p.seatId}</span></td>
      `;
      dom.revPassengersTableBody.appendChild(tr);
    });

    // Masked Contact
    dom.revMaskedPhone.textContent = state.contactInfo.maskedPhone;
    dom.revMaskedEmail.textContent = maskEmail(state.contactInfo.email);
    dom.revMaskedAadhaar.textContent = state.contactInfo.maskedAadhaar;

    // Fare calculation
    const baseTotal = state.selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const tax = Math.round(baseTotal * 0.05);
    const grandTotal = baseTotal + tax;

    dom.revSeatsList.textContent = state.selectedSeats.map(s => s.id).join(', ');
    dom.revBaseFare.textContent = `₹${baseTotal.toLocaleString('en-IN')}`;
    dom.revTax.textContent = `₹${tax.toLocaleString('en-IN')}`;
    dom.revGrandTotal.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
  }

  async function handleConfirmBooking() {
    if (!dom.agreeTermsCheck.checked) {
      showToast('Please accept the transport policies and terms of service.', 'error');
      return;
    }

    // Generate unique sample booking ID (PNR)
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const bookingId = `TN-BUS-${randomDigits}`;

    const baseTotal = state.selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const tax = Math.round(baseTotal * 0.05);
    const grandTotal = baseTotal + tax;

    let newBooking = {
      pnr: bookingId,
      createdAt: new Date().toISOString().split('T')[0],
      from: state.searchParams.from,
      to: state.searchParams.to,
      fromCode: cityCodeMap[state.searchParams.from] || 'DEP',
      toCode: cityCodeMap[state.searchParams.to] || 'ARR',
      date: state.searchParams.date,
      depTime: state.selectedBus.depTime,
      arrTime: state.selectedBus.arrTime,
      duration: state.selectedBus.duration,
      boarding: state.selectedBus.boardingPoint,
      dropping: state.selectedBus.droppingPoint,
      busId: state.selectedBus.id,
      busName: state.selectedBus.name,
      busType: state.selectedBus.type,
      seats: state.selectedSeats.map(s => s.id),
      passengers: state.passengers.map(p => ({
        name: p.name,
        age: p.age,
        gender: p.gender,
        seatId: p.seatId
      })),
      contact: {
        phone: state.contactInfo.phone,
        email: state.contactInfo.email,
        aadhaar: state.contactInfo.aadhaar,
        maskedPhone: state.contactInfo.maskedPhone,
        maskedAadhaar: state.contactInfo.maskedAadhaar
      },
      baseFare: baseTotal,
      tax: tax,
      totalFare: grandTotal,
      status: 'CONFIRMED'
    };

    // Save to Backend Database
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBooking,
          seats: state.selectedSeats
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success && resData.data) {
        newBooking = resData.data;
      } else if (response.status === 409) {
        showToast(resData.message || 'Seat conflict: selected seats were just taken!', 'error');
        return;
      }
    } catch (apiErr) {
      console.warn('Backend unavailable, saving booking locally in browser memory:', apiErr);
    }

    // Prepend to bookings array
    state.bookings.unshift(newBooking);
    state.currentBooking = newBooking;
    updateBookingsCountBadge();

    // Populate Printable Ticket and SMS Preview
    populateConfirmationArtifacts(newBooking);

    // Advance to Step 6
    showStep(6);
    showToast(`Booking ${newBooking.pnr} confirmed successfully!`, 'success');
  }

  // =========================================================================
  // STEP 6: PRINTABLE TICKET & SMS NOTIFICATION PREVIEW
  // =========================================================================
  function populateConfirmationArtifacts(booking) {
    dom.successPnrDisplay.textContent = booking.pnr;

    // Printable Ticket Fields
    dom.tktPnr.textContent = booking.pnr;
    dom.tktFromCode.textContent = booking.fromCode;
    dom.tktToCode.textContent = booking.toCode;
    dom.tktFromCity.textContent = booking.from;
    dom.tktToCity.textContent = booking.to;
    dom.tktDepTime.textContent = booking.depTime;
    dom.tktArrTime.textContent = booking.arrTime;
    dom.tktBoarding.textContent = booking.boarding;
    dom.tktDropping.textContent = booking.dropping;
    dom.tktDuration.textContent = booking.duration;
    dom.tktDate.textContent = formatDisplayDate(booking.date);
    dom.tktBusName.textContent = booking.busName;
    dom.tktBusType.textContent = booking.busType;
    dom.tktSeats.textContent = booking.seats.join(', ');

    // Reporting time 15m prior
    const depH = parseInt(booking.depTime.split(':')[0], 10);
    const depM = parseInt(booking.depTime.split(':')[1], 10);
    const reportTotalM = (depH * 60 + depM - 15 + 1440) % 1440;
    const rH = Math.floor(reportTotalM / 60);
    const rM = reportTotalM % 60;
    dom.tktReportTime.textContent = `${String(rH).padStart(2, '0')}:${String(rM).padStart(2, '0')} (15m before)`;

    // Manifest Table
    dom.tktManifestTableBody.innerHTML = '';
    booking.passengers.forEach(p => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong class="text-primary">${p.seatId}</strong></td>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td>${p.age}</td>
        <td>${p.gender}</td>
        <td><span class="status-badge status-confirmed">CONFIRMED</span></td>
      `;
      dom.tktManifestTableBody.appendChild(row);
    });

    dom.tktAadhaarMasked.textContent = booking.contact.maskedAadhaar;
    dom.tktPhoneMasked.textContent = booking.contact.maskedPhone;
    dom.tktTotalPaid.textContent = `₹${booking.totalFare.toLocaleString('en-IN')}`;
    dom.tktBarcodeNum.textContent = `${booking.pnr.replace('-', '')}9823901`;

    // Simulated Phone SMS Message
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    dom.phoneClock.textContent = timeString;
    dom.smsTimestamp.textContent = `Today, ${timeString}`;
    dom.smsTargetPhone.textContent = booking.contact.maskedPhone;

    const primaryName = booking.passengers.length > 0 ? booking.passengers[0].name.split(' ')[0] : 'Passenger';
    dom.smsMessageBody.textContent = 
`Dear ${primaryName}, your bus booking is CONFIRMED!
PNR: ${booking.pnr}
Bus: ${booking.busName} (${booking.busType})
Route: ${booking.from} to ${booking.to}
Date: ${formatDisplayDate(booking.date)}, ${booking.depTime}
Seats: ${booking.seats.join(', ')}
Total Paid: Rs.${booking.totalFare.toLocaleString('en-IN')}

Have a safe journey! Track bus at: voyagebus.in/track
Helpline: 1800-419-8989`;
  }

  // =========================================================================
  // VIEW: MY BOOKINGS
  // =========================================================================
  function renderMyBookingsView() {
    dom.bookingsListContainer.innerHTML = '';

    if (state.bookings.length === 0) {
      dom.bookingsListContainer.innerHTML = `
        <div class="no-buses-found">
          <div class="no-buses-icon">🎫</div>
          <h3>No Booking History Yet</h3>
          <p class="text-muted">You haven't made any bus reservations during this session.</p>
          <button type="button" class="btn btn-primary" id="bookFirstTripBtn" style="margin-top: 1rem;">
            Book a Ticket Now
          </button>
        </div>
      `;
      document.getElementById('bookFirstTripBtn').addEventListener('click', () => {
        showStep(1);
      });
      return;
    }

    state.bookings.forEach(b => {
      const card = document.createElement('div');
      card.className = 'booking-item-card';
      const isConfirmed = b.status === 'CONFIRMED';

      card.innerHTML = `
        <div class="booking-item-top">
          <div class="booking-pnr-group">
            <span class="booking-pnr-label">REFERENCE PNR:</span>
            <span class="booking-pnr-val">${b.pnr}</span>
          </div>
          <span class="status-badge ${isConfirmed ? 'status-confirmed' : 'status-cancelled'}">
            ${b.status}
          </span>
        </div>

        <div class="booking-item-content">
          <div class="booking-route-cell">
            <span class="booking-route-title">${b.from} ➔ ${b.to}</span>
            <span class="booking-operator-sub">${escapeHtml(b.busName)} • ${escapeHtml(b.busType)}</span>
          </div>

          <div class="booking-detail-cell">
            <span class="booking-detail-label">JOURNEY DATE & TIME</span>
            <span class="booking-detail-val">${formatDisplayDate(b.date)} • ${b.depTime}</span>
          </div>

          <div class="booking-detail-cell">
            <span class="booking-detail-label">SEATS ALLOTTED</span>
            <span class="booking-detail-val">${b.seats.join(', ')} (${b.passengers.length} pax)</span>
          </div>

          <div class="booking-actions">
            <button type="button" class="btn btn-outline btn-sm view-ticket-btn" data-pnr="${b.pnr}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 15px; height: 15px;">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>View Ticket</span>
            </button>
            ${isConfirmed ? `
              <button type="button" class="btn btn-ghost btn-sm cancel-booking-btn" data-pnr="${b.pnr}" style="color: var(--danger);">
                Cancel
              </button>
            ` : ''}
          </div>
        </div>
      `;

      dom.bookingsListContainer.appendChild(card);
    });

    // Attach actions
    dom.bookingsListContainer.querySelectorAll('.view-ticket-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pnr = btn.getAttribute('data-pnr');
        const booking = state.bookings.find(b => b.pnr === pnr);
        if (booking) {
          populateConfirmationArtifacts(booking);
          showStep(6);
        }
      });
    });

    dom.bookingsListContainer.querySelectorAll('.cancel-booking-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pnr = btn.getAttribute('data-pnr');
        if (confirm(`Are you sure you want to cancel booking ${pnr}?`)) {
          try {
            await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(pnr)}/cancel`, {
              method: 'POST'
            });
          } catch (apiErr) {
            console.warn('Backend cancel failed, updating locally:', apiErr);
          }

          const booking = state.bookings.find(b => b.pnr === pnr);
          if (booking) {
            booking.status = 'CANCELLED';
            renderMyBookingsView();
            updateBookingsCountBadge();
            showToast(`Booking ${pnr} has been cancelled.`, 'info');
          }
        }
      });
    });
  }

  function updateBookingsCountBadge() {
    const activeCount = state.bookings.filter(b => b.status === 'CONFIRMED').length;
    dom.bookingsCountBadge.textContent = activeCount;
  }

  // =========================================================================
  // EVENT BINDINGS
  // =========================================================================
  function bindEvents() {
    // Top Nav
    dom.logoBtn.addEventListener('click', () => showStep(1));
    dom.navHomeBtn.addEventListener('click', () => showStep(1));
    dom.navBookingsBtn.addEventListener('click', () => {
      renderMyBookingsView();
      showStep('bookings');
    });

    // Safety Modal
    dom.navSafetyBtn.addEventListener('click', () => dom.safetyModal.classList.add('active'));
    dom.closeSafetyModalBtn.addEventListener('click', () => dom.safetyModal.classList.remove('active'));
    dom.gotItSafetyBtn.addEventListener('click', () => dom.safetyModal.classList.remove('active'));
    dom.safetyModal.addEventListener('click', (e) => {
      if (e.target === dom.safetyModal) dom.safetyModal.classList.remove('active');
    });

    // Step 1: Search Form
    dom.searchForm.addEventListener('submit', handleSearchSubmit);
    dom.swapCitiesBtn.addEventListener('click', swapCities);
    dom.quickTags.forEach(tag => tag.addEventListener('click', handleQuickTag));

    // Step 2: Bus Results & Filters
    dom.modifySearchBtn.addEventListener('click', () => showStep(1));
    dom.resetFiltersBtn.addEventListener('click', resetFilters);

    dom.busTypeFilters.forEach(cb => {
      cb.addEventListener('change', (e) => {
        if (e.target.value === 'ALL' && e.target.checked) {
          dom.busTypeFilters.forEach(other => {
            if (other.value !== 'ALL') other.checked = false;
          });
        } else if (e.target.checked) {
          const allCb = Array.from(dom.busTypeFilters).find(c => c.value === 'ALL');
          if (allCb) allCb.checked = false;
        }
        renderBusesList();
      });
    });

    dom.priceRangeSlider.addEventListener('input', (e) => {
      dom.priceRangeDisplay.textContent = `₹${e.target.value}`;
      renderBusesList();
    });

    dom.sortBusesSelect.addEventListener('change', renderBusesList);

    dom.timeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const timeVal = chip.getAttribute('data-time');
        if (state.filterOptions.departureTime === timeVal) {
          state.filterOptions.departureTime = null;
          chip.classList.remove('active');
        } else {
          state.filterOptions.departureTime = timeVal;
          dom.timeChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        }
        renderBusesList();
      });
    });

    // Step 3: Deck Tabs & Buttons
    dom.lowerDeckTabBtn.addEventListener('click', () => {
      dom.lowerDeckTabBtn.classList.add('active');
      dom.upperDeckTabBtn.classList.remove('active');
      dom.lowerDeckContainer.classList.add('active');
      dom.upperDeckContainer.classList.remove('active');
    });

    dom.upperDeckTabBtn.addEventListener('click', () => {
      dom.upperDeckTabBtn.classList.add('active');
      dom.lowerDeckTabBtn.classList.remove('active');
      dom.upperDeckContainer.classList.add('active');
      dom.lowerDeckContainer.classList.remove('active');
    });

    dom.backToBusesBtn.addEventListener('click', () => showStep(2));
    dom.proceedToPassengerBtn.addEventListener('click', () => {
      if (state.selectedSeats.length === 0) {
        showToast('Please select at least 1 seat to proceed.', 'error');
        return;
      }
      setupPassengerForm();
      showStep(4);
    });

    // Step 4: Passenger Form
    dom.passengerDetailsForm.addEventListener('submit', handlePassengerSubmit);
    dom.backToSeatsBtn.addEventListener('click', () => showStep(3));

    // Step 5: Review Actions
    dom.confirmBookingBtn.addEventListener('click', handleConfirmBooking);
    dom.editDetailsBtn.addEventListener('click', () => showStep(4));

    // Step 6: Confirmation Actions
    dom.printTicketBtn.addEventListener('click', () => {
      window.print();
    });

    dom.viewInMyBookingsBtn.addEventListener('click', () => {
      renderMyBookingsView();
      showStep('bookings');
    });

    dom.bookNewJourneyBtn.addEventListener('click', () => {
      // Clear inputs & restart
      state.selectedSeats = [];
      state.passengers = [];
      showStep(1);
    });

    // My Bookings Back Button
    dom.myBookingsBackBtn.addEventListener('click', () => showStep(1));
  }

  // =========================================================================
  // HELPER UTILITIES
  // =========================================================================
  function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return dateObj.toLocaleDateString('en-US', options);
  }

  function groupBy(arr, key) {
    return arr.reduce((acc, item) => {
      (acc[item[key]] = acc[item[key]] || []).push(item);
      return acc;
    }, {});
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start the application
  initApp();
});
