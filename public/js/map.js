
	
    mapboxgl.accessToken = maptoken ;

    const map = new mapboxgl.Map({
      style : 'mapbox://styles/mapbox/streets-v11', // style URL
        container: 'map', // container ID
        center: [ 76.2653,  20.3491], // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    });
