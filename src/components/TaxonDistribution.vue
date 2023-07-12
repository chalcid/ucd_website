<template>
  <div>
    <span v-show="!isLoading" style="width: 600px; display:inline-block;">Distribution: {{ sortedTaxonDistributions.join(', ') }}</span>
    <span v-show="isLoading">Please wait for the map to load...</span>
    <div id="map" class="leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom" style="width: 600px; height: 400px; position: relative; outline-style: none;"></div>
  </div>
  <references :ad-Prop="adReferences"></references>
</template>

<script>
  import { computed, ref, reactive, onMounted, toRefs } from 'vue';
  import L from 'leaflet';
  import 'leaflet-providers';
  import api from '/api.js';
  import References from './References.vue';

  export default {
    name: 'TaxonDistributions',

    props: {
      baProp: Array
    },
    
    components: {
      References
    },

    setup(props) {
      const map = ref(null);
      
      const state = reactive({
        isLoading: true,
        taxonDistributionsJson: [],
        showTaxonDistributions: true
      });

      const sortedTaxonDistributions = computed(() => {
        const uniqueCountries = new Set(
          state.taxonDistributionsJson.map(item => item.geographic_area.name)
        );

        return Array.from(uniqueCountries).sort();
      });
      
      const adReferences = computed(() => {
        let references = state.taxonDistributionsJson.flatMap(item => item.citations.map(citation => citation.source.name));
        return references.sort();
      });
      
      onMounted(async () => {
        await fetchTaxonDistributions();
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

          const geojsonArray = state.taxonDistributionsJson.map((item) => {
            if (item.geographic_area.shape?.geometry) {
              return item.geographic_area.shape.geometry;
            }
            return null;
          });

          geoJsonLayer.clearLayers();

          geojsonArray.forEach((item) => {
            if (item) {
              geoJsonLayer.addData(item);
            }
          });
        } catch (error) {
          console.log("Reload if you do not see the map. The map sent this error message, although map errors do not seem to be fatal in many cases: " + error.message)
        };
      };

      const fetchTaxonDistributions = async () => {
        if (props.baProp) {
          const tdResponse = await api.get(`/asserted_distributions?`,
            {params: {
              taxon_name_id: props.baProp,
              embed: ["shape"],
              extend: ["geographic_area", "citations"],
              geo_json: "true",
              per: "10000",
              descendants: "true",
              token: import.meta.env.VITE_APP_API_TOKEN,
              project_token: import.meta.env.VITE_APP_PROJECT_TOKEN,
            }}                                 
          );
          const newData = tdResponse.data;
          state.taxonDistributionsJson.length = 0;
          state.taxonDistributionsJson.push(...newData);
          
          initializeMap();
        }
      };

      return {
        ...toRefs(state),
        sortedTaxonDistributions,
        map,
        initializeMap,
        fetchTaxonDistributions,
        adReferences
      };
    }
  };
</script>