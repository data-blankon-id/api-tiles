var host = 'data-blankon-id.github.io'
if (window.location.host == host && window.location.protocol != 'https:')
  window.location.protocol = 'https:'

var map = L.map('map').setView([-1.269160, 116.825264], 3);
var tiles = L.tileLayer('http://data.blankon.id/api/tiles?s={s}&z={z}&x={x}&y={y}', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery &copy <a href="http://openstreetmap.org">OpenStreetMap</a> via <a href="https://data.blankon.id/docs">Data.BlankOn.id server</a>'
}).addTo(map);
