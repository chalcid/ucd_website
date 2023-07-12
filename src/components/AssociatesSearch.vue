<template v-slot:associatesSearch>
    <div class="row" ref="containerOfComponent" v-show="show" name="associatesSearchContainer">
      <fieldset>
        <legend>Search Mode</legend>
        <div>
          <div>
            <input type="radio" id="autocomplete-search" value="autocomplete" v-model="searchMode" />
            <label style="padding-left: 2px; padding-right: 15px;" for="autocomplete-search">Autocomplete search (wait for results to appear)</label>
          </div>
          <div>
            <input type="radio" id="regular-search" value="regular" v-model="searchMode" />
            <label style="padding-left: 2px;" for="regular-search">Regular search</label>
          </div>
        </div>
      </fieldset>
      <div v-if="searchMode === 'regular'" class="col-8" ref="containerOfInputGroup">
        <div class="input-group mb-3 align-items-start" id="associates-search-group">
          <span class="input-group-text" id="genus-input-label">genus</span>
          <input type="text" class="form-control" id="associates-search-input" aria-describedby="genus-input" v-model="genus" @keyup.enter="useInputTerms($event)" />
          <span class="input-group-text" id="species-input-label">species</span>
          <input type="text" class="form-control" id="associates-search-input" aria-describedby="species-input" v-model="species" @keyup.enter="useInputTerms($event)" />
          <button class="btn btn-outline-secondary" type="button" id="associates-search-button" @click="useInputTerms($event)">search</button>
        </div>
      </div>
      <div v-if="searchMode === 'autocomplete'" class="col-12" ref="containerOfInputGroup">
        <div class="dropdown">
          <input type="text" v-model="searchTerm" @input="fetchAutocompleteResults" @select="handleSelection" @focus="showDropdown = true" />
          <ul id="dropdown-menu" ref="autocompleteList" v-show="showDropdown">
            <li 
              v-for="result in autocompleteResults" 
              :key="result.id" 
              @click="displayAutocompleteTaxonPage(result)"
              v-html="formatResult(result)">
            </li>
          </ul>
        </div>
      </div>
    </div>
    <br>
    <searchResults :srProp="apiResults"></searchResults>
  </template>
  
  <style scoped>
    #dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      list-style: none;
      padding: 0;
      margin: 0;
      background-color: #ffffff;
      border: 1px solid #cccccc;
      border-top: 1px solid #cccccc;
      z-index: 100;
      min-width: 12%;
    }
  
    #dropdown-menu li {
      padding: 0.5rem;
      cursor: pointer;
    }
  
    #dropdown-menu li:hover {
      background-color: #d6c20d;
    }
    
    #associates-search-input {
      max-width: 500px;
    }
  </style>
    
  <script>
    import { reactive } from '@vue/runtime-core'
    import api from '/api.js'
    import { useRouter } from 'vue-router'
    import { toRefs } from '@vue/reactivity'
    import SearchResults from './SearchResults.vue'
  
    export default {
      name: 'AssociatesSearch',
      
      components: {
        SearchResults
      },
      
      setup() {
        const state = reactive({
          show: true,
          searchMode: "autocomplete",
          genus: '',
          species: '',
          apiResults: [],
          listClickedText: '',
          taxonClicked: [],
          taxonIDClicked: '',
          sortedResponse: [],
          showDropdown: false,
          searchTerm: '',
          autocompleteResults: []
        });
        
        const router = useRouter();
               
        const fetchAutocompleteResults = async () => {
          try {
            const response = await api.get(`/otus/autocomplete`, 
              {params: {
                having_taxon_name_only: 'true',
                token: import.meta.env.VITE_APP_API_TOKEN,
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN,
                term: state.searchTerm
              }})
            state.autocompleteResults = response.data
          } catch (error) {
            console.error(`An error occurred when calling fetchAutocompleteResults: ${error.message}`)
            console.error(error.stack)
          }
        };
        
        const useInputTerms = async () => {
          try { 
            if(state.searchMode === "regular") {
              if(state.genus && state.species){
                state.genus = state.genus.replace(/^./, state.genus[0].toUpperCase());
                state.species = state.species.replace(/./, state.species[0].toLowerCase());
                const response = await api.get(`/taxon_names`,
                  {params: {
                    name: state.genus + " " + state.species,
                    rank: 'NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Species',
                    validity: 'true',
                    exact: 'true',
                    token: import.meta.env.VITE_APP_API_TOKEN,
                    project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
                  }})
                state.apiResults = response.data
                sortResponse();
              }
              else if(state.genus && state.species===''){
                state.genus = state.genus.replace(/^./, state.genus[0].toUpperCase());
                const response = await Promise.all([
                  api.get(`/taxon_names`,
                    {params: {
                      name: state.genus,
                      rank: 'NomenclaturalRank::Icn::GenusGroup::Genus',
                      validity: 'true',
                      token: import.meta.env.VITE_APP_API_TOKEN,
                      project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
                    }}),
                  api.get(`/taxon_names`,
                    {params: {
                      name: state.genus,
                      rank: 'NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Species',
                      validity: 'true',
                      token: import.meta.env.VITE_APP_API_TOKEN,
                      project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
                    }}),
                ]);
                const [genusResponse, speciesResponse] = response;
                state.apiResults = genusResponse.data.concat(speciesResponse.data);
                sortResponse();
              }
              else if(state.species){
                state.species = state.species.replace(/^./, state.species[0].toLowerCase());
                state.genus = " ";
                const response = await api.get(`/taxon_names`,
                  {params: {
                    name: state.species,
                    rank: 'NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Species',
                    validity: 'true',
                    token: import.meta.env.VITE_APP_API_TOKEN,
                    project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
                  }})
                state.apiResults = response.data;
                sortResponse();
              }
            } else if(state.searchMode === "autocomplete") {
              
            }
          } catch (error) {
            console.error(`An error occurred when calling useInputTerms: ${error.message}`)
            console.error(error.stack);
          }
        };
          
        const displayTaxonPage = (taxonClicked) => {
          state.taxonClicked = taxonClicked;
          router.push({ name: 'TaxonPage', query: { taxonID: taxonClicked.id }});
          state.show = !state.show;
        };
        
        const displayAutocompleteTaxonPage = (result) => {
          const parser = new DOMParser();
          const html = parser.parseFromString(result.label_html, 'text/html');
          const title = html.querySelector('span.otu_tag_taxon_name').title;
          router.push({ name: 'TaxonPage', query: { taxonID: title }});
          state.show = !state.show;
        }
          
        const sortResponse = () => {
          state.sortedResponse = state.apiResults.sort((a, b) => {
            if (a.cached < b.cached) return -1
            if (a.cached > b.cached) return 1
            return 0
          })
        }
          
        const formatResult = (result) => {
          const htmlTag = result.htmlTag
          return `<${htmlTag}>${result.label_html}</${htmlTag}>`
        }
          
        const handleSelection = (item) => {
            displayTaxonPage(item);
        }
        
        return {
          ...toRefs(state),
          fetchAutocompleteResults,
          useInputTerms,
          displayTaxonPage,
          displayAutocompleteTaxonPage,
          sortResponse,
          formatResult,
          handleSelection
        };
      }
    }
  </script>