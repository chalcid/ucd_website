<template>
  <div class="row" ref="containerOfResults" name="associatesSearchResultsContainer">
    <div class="col-12 bd-highlight align-items-start" id="results-list-div" ref="resultsList">
    <span class="search-results">
      <li style="list-style-type:none" 
        v-if="srProp" 
        v-for="(taxonNameItem, index) in srProp" 
          :key="taxonNameItem.id">
          <a style="text-decoration:underline; color: var(--bs-link-color);" @click="displayTaxonPage(srProp[index]), show=!show">
          <span v-if="srProp[index].rank_string==='NomenclaturalRank::Iczn::GenusGroup::Genus' || srProp[index].rank_string==='NomenclaturalRank::Iczn::SpeciesGroup::Species' || srProp[index].rank_string==='NomenclaturalRank::Icn::GenusGroup::Genus' || srProp[index].rank_string==='NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Species'"><i>{{ srProp[index].cached }}</i></span><span v-else>{{ srProp[index].cached }}</span> {{ srProp[index].cached_author_year }}</a></li>
      <span v-else>No search results have been returned yet.</span>
    </span>
    </div>
  </div>
</template>

<style>
  #results-list-div {
    padding-left: 2em;
  }
</style>

<script>
  import { reactive } from '@vue/runtime-core'
  import { useRouter } from 'vue-router'
  
  export default {
    name: 'SearchResults',
    
    props: {
      srProp: Array
    },
    
    setup() {
      const state = reactive({
        show: true,
        taxonClicked: []
      });
      
      const router = useRouter();
        
      const displayTaxonPage = (taxonClicked) => {
        state.taxonClicked = taxonClicked;
        router.push({ name: 'TaxonPage', query: { taxonID: taxonClicked.id }});
        state.show = !state.show;
      };
      
      return {
        displayTaxonPage
      };
    }
  }
</script>