<template>
  <p><strong>Filter by taxon name:</strong></p>
  <BinomialFilter :key="resetKey" @taxon-selected="onTaxonSelected" />
  <button @click="resetTaxa()">Reset taxon filter</button>  <button @click="nothingClicked = true">Go back to area list</button>
  <br><br>

  <div v-if="countryData.length > 0">
    <ul class="ul-home-page" v-if="nothingClicked">
      <li><i>Note: be prepared to wait a few seconds if you choose a region with many records.</i></li>
      <button @click="fetchAllDistributions">Fetch Selected Distributions</button>
      <li v-for="(continent) in countryData" :key="continent.continent">
        <input type="checkbox" @change="toggleContinentSelection(continent)" :checked="isContinentSelected(continent)" />
        <span>&nbsp;</span>
        <button @click="toggleContinent(continent.continent)" id="treeButton">
          <span v-if="openContinents[continent.continent]">-</span>
          <span v-else>+</span>
        </button>
        {{ continent.continent }}
        <ul class="ul-home-page" v-if="openContinents[continent.continent]">
          <li v-for="(zone) in continent.zones" :key="zone.zone">
            <input type="checkbox" @change="toggleZoneSelection(zone)" :checked="isZoneSelected(zone)" />
            <span>&nbsp;</span>
            <button @click="toggleZone(zone.zone)" id="treeButton">
              <span v-if="openZones[zone.zone]">-</span>
              <span v-else>+</span>
            </button>
            <span>&nbsp; {{ zone.zone }} </span>
            <ul class="ul-home-page" v-if="openZones[zone.zone]">
              <li v-for="(country) in zone.countries" :key="country.id">
                <input type="checkbox" v-model="selectedCountries" :value="country.id" />
                <button v-if="country.regions" @click="toggleCountry(country.id)" id="treeButton">
                  <span v-if="openCountries[country.id]">-</span>
                  <span v-else>+</span>
                </button>
                <span v-if="country.regions" id="countryWithRegions">
                  {{ country.name }}
                </span>
                <span v-else id="countryWithoutRegions">
                  {{ country.name }}
                </span>
                <ul class="ul-home-page" v-if="openCountries[country.id]">
                  <li v-for="(region) in country.regions" :key="region.id">
                    <input type="checkbox" v-model="selectedRegions" :value="region.id" />
                    <span id="itemDescendant">
                      {{ region.name }}
                    </span>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    <div v-if="!nothingClicked">
      <ul class="ul-home-page" v-if="dsList.length">
        <li><b>Taxa present in: {{ headerName }} </b></li>
        <li v-for="(item, index) in dsList" :key="index">
          <a class="normal-links" @click="displayTaxonPage(item.taxon_name_id)"
            :style="{ fontStyle: item.shouldItalicize ? 'italic' : 'normal' }">
              {{ item.formattedName }}
          </a>
      </li>
  </ul>

      <div v-else><img src="/bars-rotate-fade.svg" alt="Loading..."></div>
    </div>
  </div>
  <div v-else><img src="/bars-rotate-fade.svg" alt="Loading..."></div>
</template>

<script>
  import { onMounted, reactive, toRefs, ref, computed, watch } from 'vue';
  import api from '/api.js'
  import { useRouter } from 'vue-router'
  import BinomialFilter from './BinomialFilter.vue';
  
  export default {
    name: 'DistributionSearch',
    
    components: {
      BinomialFilter
    },
    
    setup(props) {
      const state = reactive({
        distributions: [],
        geographic_area_id: '',
        dsList: [],
        countryResult: [],
        nothingClicked: true,
        region: [],
        headerName: ''
      });
      
      const router = useRouter();      
      const countryData = ref([]);
      const openContinents = reactive({});
      const openZones = reactive({});
      const openCountries = reactive({});
      const selectedCountries = ref([]);
      const selectedRegions = ref([]);
      const taxonSelected = ref('');
      const binomialRef = ref(null);
      const resetKey = ref(0);
      const resetAreas = ref(0);
      
      const onTaxonSelected = ({ id }) => {
        taxonSelected.value = id ?? ''
      }
      
      watch(taxonSelected, (val) => {
        fetchAllDistributions();
      })
      
      const headerName = computed(() => {
        if (!countryData.value.length) return "No selection";

        const countryNames = selectedCountries.value.map(id => {
            for (const continent of countryData.value) {
                for (const zone of continent.zones) {
                    const country = zone.countries.find(country => country.id === id);
                    if (country) return country.name;
                }
            }
            return null;
        }).filter(Boolean);

        const regionNames = selectedRegions.value.map(id => {
            for (const continent of countryData.value) {
                for (const zone of continent.zones) {
                    for (const country of zone.countries) {
                        if (country.regions) {
                            const region = country.regions.find(region => region.id === id);
                            if (region) return region.name;
                        }
                    }
                }
            }
            return null;
        }).filter(Boolean);

        return [...countryNames, ...regionNames].join(", ") || "No selection";
     });

      
      onMounted(async () => {        
        const response = await fetch('/countryList.json')
        const data = await response.json();
        countryData.value = data;
        
        data.forEach(continent => {
          openContinents[continent.continent] = false;
          continent.zones.forEach(zone => {
            openZones[zone.zone] = false;
            zone.countries.forEach(country => {
              openCountries[country.id] = false;
            });
          });
        });
      });
      
      const toggleContinent = id => openContinents[id] = !openContinents[id];
      const toggleZone = id => openZones[id] = !openZones[id];
      const toggleCountry = id => openCountries[id] = !openCountries[id];
      
      const isContinentSelected = continent => {
        return continent.zones.every(zone => 
          zone.countries.every(country => selectedCountries.value.includes(country.id))
        );
      };
      
      const isZoneSelected = zone => {
        return zone.countries.every(country => selectedCountries.value.includes(country.id));
      };
      
      const toggleContinentSelection = continent => {
        const allCountries = continent.zones.flatMap(zone => zone.countries.map(country => country.id));
        if (isContinentSelected(continent)) {
          selectedCountries.value = selectedCountries.value.filter(id => !allCountries.includes(id));
        } else {
          selectedCountries.value = [...new Set([...selectedCountries.value, ...allCountries])];
        }
      };
      
      const toggleZoneSelection = (zone) => {
        const allCountries = zone.countries.map(country => country.id);

        if (isZoneSelected(zone)) {
            selectedCountries.value = selectedCountries.value.filter(id => !allCountries.includes(id));
        } else {
            selectedCountries.value = [...new Set([...selectedCountries.value, ...allCountries])];
        }
      };
      
      const areaClick = (clickedCountry) => {
        state.geographic_area_id = countryData.value.find(c => c.id === clickedCountry)?.id;
      };
      
      const fetchAllDistributions = async () => {
        state.nothingClicked = false;
        const selectedAreas = [...selectedCountries.value, ...selectedRegions.value];
        
        if(selectedAreas.length < 1){
          state.nothingClicked = true;
          return;
        }

        if (!selectedAreas.length) return;

        try {
            //console.log("Fetching distributions for areas:", selectedAreas);

            const responses = await Promise.all(
                selectedAreas.map(area =>
                    api.get(`/asserted_distributions`, {
                        params: {
                            geo_shape_type: 'GeographicArea',
                            geo_shape_id: area,
                            geo_mode: 'false',
                            taxon_name_id: (taxonSelected.value && String(taxonSelected.value).length > 0) ? taxonSelected.value : undefined,
                            descendants: true,
                            extend: ["asserted_distribution_shape","asserted_distribution_object"],
                            per: 5000,
                            project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
                        }
                    })
                )
            );

            //console.log("Total API Responses:", responses.length);
            //console.log("Total Records Fetched:", responses.reduce((sum, res) => sum + res.data.length, 0));

            const mergedResults = responses.flatMap(response => response.data);
            const uniqueResults = Array.from(new Map(mergedResults.map(item => [item.asserted_distribution_object.taxon_name_id, item])).values());
            //console.log("unique_results", uniqueResults);

            //console.log("Unique Records After Filtering:", uniqueResults.length);
            
            const sortedDsList = uniqueResults.slice().sort((a, b) => 
                a.asserted_distribution_object.taxon_name.localeCompare(b.asserted_distribution_object.taxon_name)
            );
            
            const processTaxonName = (formatted) => {
                if (!formatted) return "";

                formatted = formatted.replace(/<\/?i>/g, '');
                return formatted;
            };

            const formattedDsList = sortedDsList.map(item => ({
                taxon_name_id: item.asserted_distribution_object.taxon_name_id,
                formattedName: processTaxonName(item.asserted_distribution_object.taxon_name),
                shouldItalicize: true
            }));
            
            state.dsList = [];
            for (let i = 0; i < formattedDsList.length; i += 100) {
                state.dsList.push(...formattedDsList.slice(i, i + 100));
                await new Promise(resolve => setTimeout(resolve, 20));
            }

            //console.log("Data fully loaded and processed.");
        } catch (error) {
            console.error("Error fetching distributions:", error);
        }
      };
      
      const displayTaxonPage = (taxonClicked) => {
        state.taxonClicked = taxonClicked;
        router.push({ name: 'TaxonPage', query: { taxonID: taxonClicked }});
        state.show = !state.show;
      };
      
      const resetCountryResult = () => {
        state.nothingClicked = !state.nothingClicked;
        state.countryResult = [];
        state.selectedCountries = [];
      };
      
      const resetTaxa= () => {
        resetKey.value++;
        taxonSelected.value = '';
      };
      
      return { 
        ...toRefs(state),
        fetchAllDistributions,
        countryData,
        openContinents,
        openZones,
        openCountries,
        toggleContinent,
        toggleZone,
        toggleCountry,
        areaClick,
        isContinentSelected,
        fetchAllDistributions,
        isZoneSelected,
        toggleContinentSelection,
        toggleZoneSelection,
        displayTaxonPage,
        resetCountryResult,
        selectedCountries,
        selectedRegions,
        taxonSelected,
        binomialRef,
        headerName,
        onTaxonSelected,
        resetKey,
        resetTaxa,
        resetAreas
      };
    }
  };
</script>