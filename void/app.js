function getInitialCountry (code) {
  return voidCountries[code];
}
function selectCountry ($el,code) {
  $el.val(code);
}
//
// Get all countries from data
function getCountries (companyData) {
  let countries = new Set(
    companyData.features.map (

      company => company.properties.countryCode
    )
  );
  const countriesArray = Array.from(countries).sort();      // Convert set to array and sort
  return countriesArray;
}
//
// Get all company types from data
function getCompanyTypes (companyData) {
  let types = new Set(companyData.features.map(company => company.properties.type));
  const typesArray = Array.from(types).sort();
  return typesArray;
}
function getCountryName(countryCode) {
  return voidCountries[countryCode].name;
}
function getTypeName(type) {
  return voidCompanyTypes[type].name;
}

//
// Build Country select
function buildCountrySelect($select,countries) {
  for (const countryCode of countries) {
    if (countryCode.length===0) {continue;}
    $select.append('<option value="' + countryCode + '">' + getCountryName(countryCode) + '</option>');
  }
}
//
// Build types select
function buildTypesControl($control,types) {
  for (const type of types) {
    $control.append('<input type="checkbox" name="void_type"  class="js-void--types-type" value="' + type + '" checked/>' + getTypeName(type) + '<br />' );
  }
}

function getInfoWindow(features) {
  const infoWindowHtml =
    '<div class="void_map-iw-wrap">' +
      '<h3 class="void_map-iw-title">' + features.getProperty("name") + "</h3>" +
      '<div class="void_map-iw-desc">' + features.getProperty("shortDescription") + "</div>" +
      '<div class="void_map-iw-info">' + features.getProperty("website") + "</div>" +
    '</div>';
  return infoWindowHtml;
}


//
// Main processing
function voidProcessing($) {

  if (!$('body').hasClass('page-template-void_page')) {return;}

  let map;
  let autocomplete;
  let mapDataLayer;

  const countries = getCountries(voidGeoJSON);
  const types = getCompanyTypes(voidGeoJSON);
  //
  // UI elements
  const $countrySelect = $('.js-void--country-select');
  const $cityInput = $('.js-void--city-input');
  const $typesContainer =$('.js-void--types-control');

  buildCountrySelect($countrySelect,countries);
  buildTypesControl($typesContainer,types);

  function loadCompanyData() {
    map.data.addGeoJson (voidGeoJSON);
    map.data.setStyle(function(feature) {
      const title=feature.getProperty('name');
      return ({
        title: title,
        visible : feature.getProperty('active')
      });
    });
      //}
    //)
    //mapDataLayer.setMap(map)
  }

  function initMap () {
    const countryCode = 'uk';
    const country = getInitialCountry(countryCode);
    selectCountry($countrySelect,countryCode);

    map = new google.maps.Map(document.getElementById('void-map'), {
      center: country.center,
      zoom: country.zoom,
      mapTypeControl: false,
      panControl: false,
      zoomControl: false,
      streetViewControl: false
    });

    const infoWindow = new google.maps.InfoWindow();

    map.data.addListener('click',function(event){

      const myHTML = getInfoWindow(event.feature);
      infoWindow.setContent(myHTML);

      infoWindow.setPosition(event.feature.getGeometry().get());
      infoWindow.setOptions({pixelOffset: new google.maps.Size(0,-30)});
      infoWindow.open(map);
    });

    autocomplete = new google.maps.places.Autocomplete(
        $cityInput[0], {
        types: ['(cities)'],
        componentRestrictions: {country : countryCode}
      });

    autocomplete.addListener('place_changed', onPlaceChanged);

    loadCompanyData();
    bindEvents();

  }
  function bindEvents(){
    //
    // Toggle types
    $typesContainer.find('input').on('change',function(event){
      const $this = $(this);
      setUnsetAllTypes($this);
      showCompanyType($this.val(), $this.prop('checked'));
    });
  }

  function setUnsetAllTypes($el) {
    //
    // If "all types" selected/deselected then set/deselect all types
    if ($el.hasClass('js-void--types-all')) {
      $typesContainer.find('input').filter('.js-void--types-type').prop('checked',$el.prop('checked'));
    } else {
      if (!$el.prop('checked')) {
        $typesContainer.find('input').filter('.js-void--types-all').prop('checked',false);
      }
    }
  }

  function showCompanyType(type, display) {
    map.data.forEach(function(feature) {
      if (type === 'all' || feature.getProperty('type') === type) {
        feature.setProperty('active', display);
      }
    });
  }
  // When the user selects a city, get the place details for the city and
  // zoom the map in on the city.
  function onPlaceChanged() {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      map.panTo(place.geometry.location);
      map.setZoom(11);
      search();
    } else {
      $cityInput[0].placeholder = 'Enter a city';
    }
  }
  //
  // Load the maps api using the api-key from configuration.ini (see wp_config)
  // Execute the init function
  // TODO: Register api key for void
  const apiKey = 'AIzaSyAkwMj5QmrvYiouUU-xGlCwtn0pRPwqIp8';
  $.getScript('https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&libraries=places', function () { initMap(); });

}



voidProcessing(jQuery);
