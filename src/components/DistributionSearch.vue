<template>
    <ul v-if="nothingClicked">
      <li><i>Note: be prepared to wait a few seconds if you choose a region with many records.</i></li>
      <li v-for="country in countryData" :key="country.id">
        <button v-show="country.regions" @click="toggleCountry(country.id)" id="treeButton">
          <span v-if="openCountries[country.id]">-</span>
          <span v-else>+</span>
        </button>
        <a @click="fetchDistributions(country.id, country.name), nothingClicked = !nothingClicked" v-if="country.regions" id="countryWithRegions" :to="{ name: 'SearchResults', state: { dsList } }" class="normal-links">
          {{ country.name }}
        </a>
        <a @click="fetchDistributions(country.id, country.name), nothingClicked = !nothingClicked" v-else id="countryWithoutRegions" :to="{ name: 'SearchResults', state: { dsList } }" class="normal-links">
          {{ country.name }}
        </a>
        <ul v-if="openCountries[country.id]">
          <li v-for="region in country.regions" :key="region.id" >
            <a @click="fetchDistributions(region.id, region.name), nothingClicked = !nothingClicked" class="normal-links" id="itemDescendant">
              {{ region.name }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
    <div v-else>
      <ul v-if="countryResult[0]">
          <li><b><a class="normal-links" @click="resetCountryResult">Return to country list</a></b></li>
          <li><b>Taxa present in: {{ headerName }} </b></li>
          <li v-for="(item, index) in dsList" :key="index">
            <span v-for="char, subIndex in splitText(item.otu.taxon_name)" :key="subIndex" :style="{fontStyle: char.shouldItalicize ? 'italic' : 'normal'}">
              <a class="normal-links" @click="displayTaxonPage(item.otu.taxon_name_id)">
                {{ char.formatted }}
              </a>
            </span>
          </li>
      </ul>
      <div v-else><img src="/spinning-circles.svg" alt="Loading..." width="75"></div>
    </div>
</template>
  
<style scoped>
  ul {
    list-style-type: none;
  }

  ul ul {
    padding-left: 20px;
  }
</style>
  
<script>
  import { onMounted, reactive, toRefs, ref } from 'vue';
  import api from '/api.js'
  import { useRouter } from 'vue-router'
  
  export default {
    name: 'DistributionSearch',
    
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
      const countryData = ref(null);
      const openCountries = ref({});
      
      onMounted(async () => {        
        const response = await fetch('/countryList.json')
        countryData.value = await response.json();
        countryData.value.forEach(country => {
          openCountries.value[country.id] = false;
        });
      });
      
      function toggleCountry(id) {
        openCountries.value[id] = !openCountries.value[id];
      };
      
      const areaClick = (clickedCountry) => {
        state.geographic_area_id = state.countries.find(c => c.id === clickedCountry);
      };
      
      const fetchDistributions = async (geographic_area_id, headerName) => {
        const response = await api.get(`/asserted_distributions`, {
          params: {
            geographic_area_id: geographic_area_id,
            per: 5000,
            project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
          },
        });
        state.countryResult = await response.data;
        state.dsList = state.countryResult.sort((a, b) => {
          if (a.otu.taxon_name < b.otu.taxon_name) {
            return -1;
          }
          if (a.otu.taxon_name > b.otu.taxon_name) {
            return 1;
          }
            return 0;
        });;
        state.headerName = headerName;
      };
                              
      const splitText = (formatted) => {
        formatted = formatted.replace(/<\/?i>/g, '');
        const parts = formatted.split(/(\s|\[sic\])/).filter(part => part !== "");
        return parts.map(part => {
          if (part === "[sic]") {
            return {
              formatted: part,
              shouldItalicize: false
            }
          }
          const characters = part.split('');
          return characters.map(char => {
            return {
              formatted: char,
              shouldItalicize: char !== "(" && char !== ")"
            }
          });
        }).flat();
      };
            
      const displayTaxonPage = (taxonClicked) => {
        state.taxonClicked = taxonClicked;
        router.push({ name: 'TaxonPage', query: { taxonID: taxonClicked }});
        state.show = !state.show;
      };
      
      const resetCountryResult = () => {
        state.nothingClicked = !state.nothingClicked;
        state.countryResult = [];
      };
  
      return { 
        ...toRefs(state),
        fetchDistributions,
        countryData,
        openCountries,
        toggleCountry,
        areaClick,
        splitText,
        displayTaxonPage,
        resetCountryResult
      };
    }
  };
  </script>  