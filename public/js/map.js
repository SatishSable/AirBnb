
	
    mapboxgl.accessToken = maptoken ;

    const map = new mapboxgl.Map({
      style : 'mapbox://styles/mapbox/streets-v11', // style URL
        container: 'map', // container ID
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    });


    const marker = new mapboxgl.Marker({color : "red"})
        .setLngLat(listing.geometry.coordinates) // Marker [lng, lat]
        .setPopup(new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${listing.title}</h3><p> Exect Location well be provided after booking</p>`
        ))
        .addTo(map);