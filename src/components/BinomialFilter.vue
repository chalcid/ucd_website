<template>
  <div class="row" ref="containerOfComponent" v-show="show" name="binomialSearchContainer">
    <div>
      <label>Autocomplete search (wait for results to appear, <strong><em>Prefer results with the checkmark (not [c]) if looking for valid names!</em>)</strong></label>
    </div>
    <div class="col-12">
      <div class="dropdown">
        <input type="text" v-model="searchTerm" @input="debouncedAutocomplete" @select="handleSelection" @focus="showDropdown = true" @blur="showDropdown = false"/>
        <ul id="dropdown-menu" class="autocomplete-results" ref="autocompleteList" v-show="showDropdown">
          <li 
            v-for="result in autocompleteResults"
            :key="result.id"
            @mousedown.prevent="filterByTaxon(result)"
            @click="onBlur"
            v-html="formatResult(result)">
          </li>
        </ul>
      </div>
    </div>
  </div>
  <span v-if="filterTaxonName.length > 0"><strong>Filtering by taxon: <span v-html="filterTaxonName"></span></strong></span>
  <span v-else><strong>Not currently filtering by taxon.</strong></span>
  <br><br>
</template>
  
<script> 
  import { reactive } from '@vue/runtime-core'
  import api from '/api.js'
  import { toRefs } from '@vue/reactivity'
  import debounce from 'lodash/debounce'

  export default {
    name: 'BinomialFilter',
    emits: ['taxon-selected'],
      
    setup(_, { emit }) {      
      const state = reactive({
        show: true,
        apiResults: [],
        sortedResponse: [],
        showDropdown: false,
        searchTerm: '',
        autocompleteResults: [],
        blankResults: false,
        filterTaxonID: '',
        filterTaxonName: ''
      });
             
      const fetchAutocompleteResults = async () => {
        try {
          const response = await api.get(`/taxon_names/autocomplete`, 
            {params: {
              //having_taxon_name_only: 'true',
              project_token: import.meta.env.VITE_APP_PROJECT_TOKEN,
              term: state.searchTerm
            }})
          state.autocompleteResults = await response.data
        } catch (error) {
          console.error(`An error occurred when using the nomenclatural search component: ${error.message}`)
        }
      };
      
      const debouncedAutocomplete = debounce(fetchAutocompleteResults, 500);
          
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
      
      const filterByTaxon = (result) => {
        //console.log("result id: ", result.id);
        state.filterTaxonName = result.label_html;
        state.filterTaxonID = result.id;
        emit('taxon-selected', {
          id: result.id
        })
      }
      
      const onBlur = () => {
        setTimeout(() => { state.showDropdown = false }, 60)
      }
      
      return {
        ...toRefs(state),
        fetchAutocompleteResults,
        sortResponse,
        formatResult,
        debouncedAutocomplete,
        filterByTaxon,
        onBlur
      };
    }
  }
</script>