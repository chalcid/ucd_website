<template>
  <div class="row" ref="containerOfComponent" name="sourcesSearchContainer">
    <!-- <fieldset>
      <legend>Mode</legend>
      <div>
        <input type="radio" id="search-sources" value="regular" v-model="searchMode" />
        <label class="padding-left-and-right" for="search-sources">Regular search</label>
      </div>
      <div>
        <input type="radio" id="browse-sources" value="browse" v-model="searchMode" />
        <label class="two-pixel-padding-left" for="browse-sources" @click="useInputTerms($event)">Browse</label>
      </div>
    </fieldset>
    -->
    <div class="col-8" ref="containerOfInputGroup">
      <div v-show="searchMode==='regular'" class="input-group mb-3 align-items-start" id="sources-search-group">
        <span class="input-group-text" id="author-input-label">author</span>
        <input type="text" class="form-control" id="sources-search-input" aria-describedby="genus-input" v-model="author" @keyup.enter="useInputTerms($event)" />
        <span class="input-group-text" id="author-input-label">year</span>
        <input type="text" style="max-width: 10%;" class="form-control" id="sources-search-input" aria-describedby="genus-input" v-model="year" @keyup.enter="useInputTerms($event)" />
        <span class="input-group-text" id="species-input-label">title word</span>
        <input type="text" class="form-control" id="sources-search-input" aria-describedby="species-input" v-model="title" @keyup.enter="useInputTerms($event)" />
        <button class="btn btn-outline-secondary" type="button" id="sources-search-button" @click="useInputTerms($event)">search</button>
      </div>
      <!-- <div v-show="searchMode==='browse'">
        
      </div>-->
    </div>
  </div>
  <searchResults :soProp="apiResults" class="space-below"></searchResults>
</template>

<script>
  import { ref, reactive, toRefs } from 'vue'
  import api from '/api.js'
  import SearchResults from './SearchResults.vue'
  import { useRouter } from 'vue-router'

  export default {
    name: 'SourcesSearch',
    
    components: {
      SearchResults
    },
    
    setup() {
      const state = reactive({
          show: true,
          searchMode: "regular",
          author: '',
          year: '',
          title: '',
          apiResults: [],
          sourceClicked: [],
          sourceIDClicked: '',
          sortedResponse: []
      });
      
      const soData = ref([]);
      const router = useRouter();
      
      const useInputTerms = async () => {
        try { 
          if(state.author && state.year && state.title){
            const response = await api.get(`/sources`,
              {params: {
                author: state.author,
                year_start: state.year,
                year_end: state.year,
                query_term: state.title,
                per: "10000",
                extend: ['bibtex'],
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
              }})
            state.apiResults = response.data
            sortResponse();
          }
          else if(state.author && state.year){
            const response = await api.get(`/sources`,
              {params: {
                author: state.author,
                year_start: state.year,
                year_end: state.year,
                per: "10000",
                extend: ['bibtex'],
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
              }})
            state.apiResults = response.data
            sortResponse();
          }
          else if(state.author && state.title){
            const response = await api.get(`/sources`,
              {params: {
                author: state.author,
                query_term: state.title,
                per: "10000",
                extend: ['bibtex'],
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
              }})
            state.apiResults = response.data
            sortResponse();
          }
          else if(state.year && state.title){
            const response = await api.get(`/sources`,
              {params: {
                year_start: state.year,
                year_end: state.year,
                query_term: state.title,
                per: "10000",
                extend: ['bibtex'],
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
              }})
            state.apiResults = response.data
            sortResponse();
          }
          else if(state.author){
            const response = await api.get(`/sources`,
              {params: {
                author: state.author,
                per: "10000",
                extend: ['bibtex'],
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
              }})
            state.apiResults = response.data
            sortResponse();
          }
          else if(state.year){
            const response = await api.get(`/sources`,
              {params: {
                year_start: state.year,
                year_end: state.year,
                per: "10000",
                extend: ['bibtex'],
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
              }})
            state.apiResults = response.data
            sortResponse();
          }
          else if(state.title && state.title.length > 3) {
            const response = await api.get(`/sources`,
              {params: {
                query_term: state.title,
                per: "10000",
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
              }})
            state.apiResults = response.data;
            sortResponse();
          }
          //else if(state.searchMode==='browse') {
          //  const response = await api.get(`/sources`,
          //    {params: {
          //      per: "50",
          //      page: "1",
          //      project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
          //    }})
          //  state.apiResults = response.data;
          //}
        } catch (error) {
          console.error(`An error occurred when calling sources: ${error.message}`)
        }
      };
      
      const sortResponse = () => {
        state.sortedResponse = state.apiResults.sort((a, b) => {
          if (a.cached < b.cached) return -1
          if (a.cached > b.cached) return 1
          return 0
        })
      }
        
      return {
        ...toRefs(state),
        soData,
        router,
        useInputTerms
      };
    }
  }
</script>