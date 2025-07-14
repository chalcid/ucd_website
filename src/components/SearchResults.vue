<template>
  <div class="row" ref="containerOfResults" name="associatesSearchResultsContainer">
    <div class="col-12 bd-highlight align-items-start" id="results-list-div" ref="resultsList">
      <ul v-if="srProp" id="results-list-span">
        <li id="results-list-item"
          v-for="(taxonNameItem, index) in srProp" 
            :key="taxonNameItem.id">
            <a class="normal-links" @click="displayTaxonPage(srProp[index]), show=!show">
            <span v-if="srProp[index].rank_string==='NomenclaturalRank::Iczn::GenusGroup::Genus' || srProp[index].rank_string==='NomenclaturalRank::Iczn::SpeciesGroup::Species' || srProp[index].rank_string==='NomenclaturalRank::Icn::GenusGroup::Genus' || srProp[index].rank_string==='NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Species'"><i>{{ srProp[index].cached }}</i></span><span v-else>{{ srProp[index].cached }}</span> {{ srProp[index].cached_author_year }}</a>
        </li>
      </ul>
      <ul v-else-if="soProp" id="results-list-span">
        <li id="results-list-item" class="space-below"
          v-for="(sourceItem, index) in soProp" 
            :key="sourceItem.id">
            <span v-html="soProp[index].cached"></span> <a title="Bibtex format for importing into reference management software" class="normal-links" @click="copyBibtex(soProp[index].bibtex)">copy bibtex</a>
        </li>
      </ul>
      <ul v-else-if="ciProp" id="results-list-span">
        <li id="results-list-item" class="space-below"
          v-for="(sourceItem, index) in ciProp" 
            :key="sourceItem.id">
            <span v-html="ciProp[index].source.cached"></span> <a title="Bibtex format for importing into reference management software" class="normal-links" @click="copyBibtex(ciProp[index].source.bibtex)">copy bibtex</a>
        </li>
      </ul>
      <span v-else>No search results have been returned yet.</span>
    </div>
  </div>
</template>

<script>
  import { computed, reactive } from '@vue/runtime-core'
  import { useRouter } from 'vue-router'
  
  export default {
    name: 'SearchResults',
    
    props: {
      srProp: Array,
      soProp: Array,
      ciProp: Array
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
      
      const bibtex = computed(() => props.soProp[props.index].bibtex);
      
      const copyBibtex = (bibtex) => {
        try {
          navigator.clipboard.writeText(bibtex);
          return { copyBibtex };
        } catch (error) {
          console.log("There was a problem copying the bibtex.")
        };
      };
      
      return {
        displayTaxonPage,
        bibtex,
        copyBibtex
      };
    }
  }
</script>