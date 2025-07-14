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
        <span v-else-if="!showReferences && kwProp"> Show topic references</span>
        <span v-else-if="kwProp"> Topic references</span>
      </button>
      <button class="btn btn-outline-primary" id="outline-button" v-show="showReferences" @click="downloadText" title="Download references as text">download (Text)</button>
      <div id="collapseReferences" v-show="showReferences">
        <div id = "showIfQuery" v-if="nrProp || barProp || adProp || kwProp">
          <ul id="results-list-span">
            <li id="results-list-item" v-show="nrProp" v-for="object_tag in sortedReferences" :key="object_tag" v-html="object_tag"></li>
            <li id="results-list-item" v-show="barProp" v-for="object_tag in sortedReferences" :key="object_tag" v-html="object_tag"></li>
            <li id="results-list-item" v-show="kwProp" v-for="object_tag in sortedReferences" :key="object_tag" v-html="object_tag"></li>
            <li id="results-list-item" v-show="adProp" v-for="name in sortedReferences" :key="name" v-html="name"></li>
          </ul>
        </div>
        <div id="showIfNoQuery" v-else>
          No references have been retrieved.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, toRefs, computed } from 'vue';
  
  export default {
    name: 'References',
    
    props: {
      adProp: Array,
      barProp: Array,
      kwProp: Array,
      nrProp: Array,
      tnProp: String
    },
    
    setup(props) {
      const state = reactive({
        showReferences: false,
        arrayInJson: [],
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
        else if (props.kwProp) {
          return sortAndRemoveDuplicates(props.kwProp);
          showReferences = true;
        }
      });

      function sortAndRemoveDuplicates(references) {
        const uniqueReferences = Array.from(
          new Set(references.map(JSON.stringify))
        ).map(JSON.parse);
        return uniqueReferences.sort();
      }
      
      const referencesText = computed(() => {
        return sortedReferences.value.join('\r\n');
      });
      
      const downloadText = () => {
        if (props.adProp) {
          var filename = `${props.tnProp}_distribution_references.txt`;
        }
        else if (props.barProp) {
          var filename = `${props.tnProp}_biological_association_references.txt`;
        }
        else if (props.nrProp){
          var filename = `${props.tnProp}_nomenclature_references.txt`;
        }
        else if (props.kwProp){
          var filename = `${props.tnProp}_topic_references.txt`;
        }
        const text = referencesText.value;
        const blob = new Blob([text], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(url);
      }
      
      return { 
        ...toRefs(state),
        sortedReferences,
        downloadText,
        referencesText
      };
    }
  }
</script>