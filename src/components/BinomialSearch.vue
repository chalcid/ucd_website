<template>
  <div class="row" ref="containerOfComponent" v-show="show" name="binomialSearchContainer">
    <fieldset>
      <legend>Search Mode</legend>
      <div>
        <input type="radio" id="autocomplete-search" value="autocomplete" v-model="searchMode" />
        <label style="padding-left: 2px; padding-right: 15px;" for="autocomplete-search">Autocomplete search (wait for results to appear)</label>
      </div>
      <div>
        <input type="radio" id="regular-search" value="regular" v-model="searchMode" />
        <label style="padding-left: 2px;" for="regular-search">Regular search (higher taxa mutually exclusive)</label>
      </div>
    </fieldset>
    <div v-if="searchMode === 'autocomplete'" class="col-12">
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
    <div v-if="searchMode === 'regular'" class="col-12 col-lg-8">
      <div class="input-group mb-3 align-items-start" id="binomial-search-group">
        <span v-show="!family" class="input-group-text">genus</span>
        <input v-show="!family" type="text" class="form-control" id="binomial-search-input" aria-describedby="genus-input" v-model="genus" @keyup.enter="useInputTerms($event)" />
        <span  v-show="!family" class="input-group-text">species</span>
        <input  v-show="!family" type="text" class="form-control" id="binomial-search-input" aria-describedby="species-input" v-model="species" @keyup.enter="useInputTerms($event)" />
        <span v-show="!genus && !species" class="input-group-text">higher</span>
        <input v-show="!genus && !species" type="text" class="form-control" id="binomial-search-input" aria-describedby="species-input" v-model="family" @keyup.enter="useInputTerms($event)" />
        <button class="btn btn-outline-secondary" type="button" @click="useInputTerms($event)">search</button>
      </div>
    </div>
  </div>
  <searchResults v-show="!blankResults" :srProp="apiResults"></searchResults>
  <span v-show="blankResults">No results were returned</span>
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
    border-top: none;
    z-index: 100;
    min-width: 100%;
  }

  #dropdown-menu li {
    padding: 0.5rem;
    cursor: pointer;
  }

  #dropdown-menu li:hover {
    background-color: #d6c20d;
  }
  
  #binomial-search-input {
    max-width: 480px;
  }
</style>
  
<script> 
  import { reactive } from '@vue/runtime-core'
  import api from '/api.js'
  import { useRouter } from 'vue-router'
  import { toRefs } from '@vue/reactivity'
  import SearchResults from './SearchResults.vue'

  export default {
    name: 'BinomialSearch',
    
    components: {
      SearchResults
    },
    
    setup() {
      const state = reactive({
        show: true,
        searchMode: "autocomplete",
        genus: '',
        species: '',
        family: '',
        apiResults: [],
        listClickedText: '',
        taxonClicked: [],
        taxonIDClicked: '',
        sortedResponse: [],
        showDropdown: false,
        searchTerm: '',
        autocompleteResults: [],
        blankResults: false
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
          console.error(`An error occurred when using the nomenclatural search component: ${error.message}`)
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
                  rank: 'NomenclaturalRank::Iczn::SpeciesGroup::Species',
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
                    rank: 'NomenclaturalRank::Iczn::GenusGroup::Genus',
                    validity: 'true',
                    token: import.meta.env.VITE_APP_API_TOKEN,
                    project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
                  }}),
                api.get(`/taxon_names`,
                  {params: {
                    name: state.genus,
                    rank: 'NomenclaturalRank::Iczn::SpeciesGroup::Species',
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
                  rank: 'NomenclaturalRank::Iczn::SpeciesGroup::Species',
                  validity: 'true',
                  token: import.meta.env.VITE_APP_API_TOKEN,
                  project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
                }})
              state.apiResults = response.data;
              sortResponse();
            }
            else if(state.family){
              state.family = state.family.replace(/^./, state.family[0].toUpperCase());
              const response = await api.get(`/taxon_names`,
                {params: {
                  name: state.family,
                  rank: ['NomenclaturalRank::Iczn::FamilyGroup::Family','NomenclaturalRank::Iczn::FamilyGroup::Subfamily','NomenclaturalRank::Iczn::FamilyGroup::Tribe','NomenclaturalRank::Iczn::FamilyGroup::Subtribe','NomenclaturalRank::Iczn::FamilyGroup::Superfamily'],
                  token: import.meta.env.VITE_APP_API_TOKEN,
                  project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
                }})
              state.apiResults = response.data;
              sortResponse();
            }
            if(state.apiResults.length === 0){
              state.blankResults = true;
            }
            else{
              state.blankResults = false;
            }
          } 
          else if(state.searchMode === "autocomplete") {
            
          }
        } catch (error) {
          console.error(`An error occurred when using the nomenclatural search component: ${error.message}`)
        }
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
      
      return {
        ...toRefs(state),
        fetchAutocompleteResults,
        useInputTerms,
        displayAutocompleteTaxonPage,
        sortResponse,
        formatResult
      };
    }
  }
</script>