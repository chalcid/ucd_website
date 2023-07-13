<template>
  <div class="row" ref="containerOfReferences" name="ReferencesContainer">
    <div class="col-12 bd-highlight align-items-start" id="References-list-div" ref="ReferencesList">
      <button class="btn btn-link" type="button" @click="showReferences = !showReferences" aria-expanded="false">
        <font-awesome-icon :icon="showReferences ? 'angle-down' : 'angle-right'" />
        <span v-if="!showReferences && nrProp"> Show nomenclatural references</span>
        <span v-else-if="nrProp"> Nomenclatural references</span>
        <span v-else-if="!showReferences && barProp"> Show biological associations references</span>
        <span v-else-if="barProp"> Biological associations references</span>
        <span v-else-if="!showReferences && adProp"> Show distribution references</span>
        <span v-else-if="adProp"> Distribution references</span>
      </button>
      <div id="collapseReferences" v-show="showReferences">
        <div id = "showIfQuery" v-if="nrProp || barProp || adProp">
          <ul id="results-list-span">
            <li style="list-style-type:none" v-show="nrProp" v-for="object_tag in sortedReferences" :key="object_tag" v-html="object_tag"></li>
            <li style="list-style-type:none" v-show="barProp" v-for="object_tag in sortedReferences" :key="object_tag" v-html="object_tag"></li>
            <li style="list-style-type:none" v-show="adProp" v-for="name in sortedReferences" :key="name" v-html="name"></li>
          </ul>
        </div>
        <div id="showIfNoQuery" v-else>
          No references have been retrieved.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped> 
  #showIfNoQuery{
    padding-left: 2em;
  }
</style>

<script>
  import { reactive, toRefs, computed } from 'vue';
  
  export default {
    name: 'References',
    
    props: {
      nrProp: Array,
      barProp: Array,
      adProp: Array
    },
    
    setup(props) {
      const state = reactive({
        showReferences: true
      });
      
      const sortedReferences = computed(() => {
       if (props.nrProp) {
        return sortAndRemoveDuplicates(props.nrProp);
      } 
      else if (props.barProp) {
        return sortAndRemoveDuplicates(props.barProp);
      }
      else if (props.adProp) {
        return sortAndRemoveDuplicates(props.adProp);
      }
      });

      function sortAndRemoveDuplicates(references) {
        const uniqueReferences = Array.from(
          new Set(references.map(JSON.stringify))
        ).map(JSON.parse);
        return uniqueReferences.sort();
      }
      
      return { 
        ...toRefs(state),
        sortedReferences
      };
    }
  }
</script>
