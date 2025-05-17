<template>
  <div>
    <span v-show="!hideMap" style="width: 600px; display:inline-block;">Distribution: {{ sortedTaxonDistributions.join(', ') }}</span>
    <span v-show="isLoading && !hideMap">Please wait for the map to load...</span>
    <div v-show="!hideMap" id="map" class="leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom" style="width: 600px; height: 400px; position: relative; outline-style: none;"></div>
  </div>
  <references v-show="!hideMap" :ad-Prop="adReferences" :tn-Prop="tnProp"></references>
</template>

<script>
  import { computed, ref, reactive, onMounted, toRefs, nextTick } from 'vue';
  import L from 'leaflet';
  import 'leaflet-providers';
  import api from '/api.js';
  import References from './References.vue';

  export default {
    name: 'TaxonDistributions',

    props: {
      baProp: Array,
      otuProp: String,
      tnProp: String
    },
    
    components: {
      References
    },

    setup(props) {
      const map = ref(null);
      
      const state = reactive({
        isLoading: true,
        hideMap: false,
        showTaxonDistributions: true
      });
      
      const taxonDistributionsJson = ref([]);
      const taxonMap = ref([]);

      const sortedTaxonDistributions = computed(() => {
        const uniqueCountries = new Set(
          taxonDistributionsJson.value.map(item => item.asserted_distribution_shape.name)
        );

        return Array.from(uniqueCountries).sort();
      });
      
      const adReferences = computed(() => {
        const citationMap = new Map();

        taxonDistributionsJson.value.forEach(item => {
          const areaName = item.geographic_area?.name || 'Unknown area';

          item.citations.forEach(citation => {
            const key = `${citation.source.global_id}::${citation.pages}`;

            if (!citationMap.has(key)) {
              citationMap.set(key, {
                sourceName: citation.source.name,
                pages: citation.pages,
                areas: new Set([areaName])
              });
            } else {
              citationMap.get(key).areas.add(areaName);
            }
          });
        });

        const references = Array.from(citationMap.values()).map(({ sourceName, pages, areas }) => {
          const areaList = Array.from(areas).sort().join(', ');
          return `${sourceName} Citation page(s): ${pages}. Reported area(s): ${areaList}`;
        });

        return references.sort();
      });
      
      onMounted(async () => {
        if (props.baProp && props.baProp.length > 0) { 
          await fetchTaxonDistributions();
        };
      });

      const initializeMap = async () => {
        try {    
          map.value = L.map('map').setView([50, 0], 1);
  
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>', 
            subdomains: 'abcd',
          }).addTo(map.value);
  
          const geoJsonLayer = L.geoJSON(null, {
            style: {
              fillColor: 'orange', // Fill color for highlighted countries
              fillOpacity: 0.5, // Fill opacity
              color: 'black', // Border color
              weight: 1, // Border weight
            },
          }).addTo(map.value);
          
          state.isLoading = false;

          geoJsonLayer.clearLayers();
          
          const parsedGeoJson = JSON.parse(taxonMap.value);

          if (taxonMap.value.length > 0) {
            geoJsonLayer.addData(parsedGeoJson);
          }
        } catch (error) {
          console.log("Reload if you do not see the map. The map sent this error message, although map errors do not seem to be fatal in many cases: " + error.message)
        };
      };

      const fetchTaxonDistributions = async () => {
        try {
          if(props.otuProp > 0) {
            const combinedDistributionPromise = Promise.all ([
              api.get(`/asserted_distributions`,
                {params: {
                  taxon_name_id: props.baProp,
                  extend: ["geographic_area", "citations"],
                  per: "10000",
                  descendants: "true",
                  project_token: import.meta.env.VITE_APP_PROJECT_TOKEN,
              }}),
              api.get(`/otus/` + props.otuProp + `/inventory/distribution` ,
                {params: {
                  project_token: import.meta.env.VITE_APP_PROJECT_TOKEN,
              }})  
            ]);
            const [tdResponse, cachedMapResponse] = await combinedDistributionPromise;
            taxonDistributionsJson.value = tdResponse.data;
            taxonMap.value = cachedMapResponse.data.cached_map.geo_json;
          };
          
          if (taxonMap.value.length === 0) {
            state.hideMap = !state.hideMap;
          }
            
          initializeMap();
        } catch (error) {
            if(error.message.includes('404')){
              console.log("There are no distribution data for this taxon.")
              state.hideMap = !state.hideMap;
            }
            else {
              console.log("There was a problem retrieving taxon distributions.")
              state.hideMap = !state.hideMap;
            };
          };
        };

      return {
        ...toRefs(state),
        sortedTaxonDistributions,
        map,
        initializeMap,
        fetchTaxonDistributions,
        adReferences,
        taxonDistributionsJson,
        taxonMap
      };
    }
  };
</script>