<template>
  <div v-if="groupedSortedBiologicalAssociations.length">
    <div class="row" ref="containerOfBiologicalAssociations" name="biologicalAssociationsContainer">
      <div class="col-12 bd-highlight align-items-start" id="biologicalAssociations-list-div" ref="biologicalAssociationsList">
        <button class="btn btn-link" type="button" @click="showBiologicalAssociations = !showBiologicalAssociations" aria-expanded="false">
          <font-awesome-icon :icon="showBiologicalAssociations ? 'angle-down' : 'angle-right'" />
          <span v-show="!showBiologicalAssociations"> Show biological associations</span>
          <span v-show="showBiologicalAssociations"> Biological associations</span>
        </button>
        <button class="btn btn-outline-primary" id="outline-button" v-show="showBiologicalAssociations" @click="downloadJSON" title="Java Script Object Notation, well-structured format">download (JSON)</button>  <button class="btn btn-outline-primary" id="outline-button" v-show="showBiologicalAssociations" @click="downloadTSV" title="Tab Separated Values, simple format">download (TSV)</button>
        <div id="collapseBiologicalAssociations" v-show="showBiologicalAssociations">
          <div id = "showIfQuery" v-if="groupedSortedBiologicalAssociations">
            <div v-for="(group, groupingFamily) in groupedSortedBiologicalAssociations" :key="groupingFamily">
              <h5 class="indent">{{ group[0] ? group[0] : 'Others' }}</h5>
              <ul id="results-list-span">
                <li id="sources-list-item" v-for="(association, index) in group[1]" :key="index" v-html="association.associationText"></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <references :bar-Prop="baReferences"></references>
  </div>
  <div class="indent" v-else-if="emptyArray === true">No biological associations are databased for this taxon name.</div>
  <div class="indent, space-above" v-else>Please wait for biological associations to load
    <div><img src="/spinning-circles.svg" alt="Loading..." width="75"></div>
  </div>
</template>

<script>
  import { reactive, toRefs, ref, onMounted, nextTick } from 'vue'
  import api from '/api.js'
  import References from './References.vue';

  export default {
    name: 'BiologicalAssociations',
    
    props: {
      baProp: Array,
      faProp: String
    },
    
    components: {
      References
    },
    
    setup(props) {
      const state = reactive({
        showBiologicalAssociations: true,
        emptyArray: false
      });
      
      const biologicalAssociationsJson = ref([]);
      const baReferences = ref([]);
      const jsonToDownload = ref(null);
      const groupedSortedBiologicalAssociations = ref([]);
      const familyName = ref('');
          
      onMounted(async () => {
        nextTick();
        
        jsonToDownload.value = {
          "Biological association data": [],
          "Biological association references": []
        };
        
        const baResponse = await api.get(`/biological_associations`,
          {params: {
            taxon_name_id: props.baProp,
            extend: ["object", "subject", "biological_relationship", "taxonomy", "biological_relationship_types", "citations", "source", "family_names"],
            per: "10000",
            descendants: "true",
            project_token: import.meta.env.VITE_APP_PROJECT_TOKEN,
          }}
        );
        
        biologicalAssociationsJson.value = await baResponse.data;
                
        const references = biologicalAssociationsJson.value.flatMap(item => item.citations.flatMap(citation => citation.source.object_tag));
        baReferences.value = references.sort();
        jsonToDownload.value["Biological association data"] = biologicalAssociationsJson.value;
        jsonToDownload.value["Biological association references"] = references;
        
        familyName.value = props.faProp;
        
        if (window.Worker && biologicalAssociationsJson.value.length > 0){
          const plainBaJSON = JSON.parse(JSON.stringify(biologicalAssociationsJson.value));
          
          const workerData = {
            plainBaJSON: plainBaJSON,
            familyName: familyName.value
          };
          
          const worker = new Worker('./src/biologicalAssociationsWorker.js');
          worker.postMessage(workerData);
          
          worker.addEventListener('message', event => {
            groupedSortedBiologicalAssociations.value = event.data;
          });
        }
        else if(groupedSortedBiologicalAssociations.value.length === 0) {
            state.emptyArray = true;
        }
        else {
          console.log("This browser does not support web workers, and therefore biological associations will not group (or even display at this stage).")
        }
      });
      
      const downloadJSON = () => {
        const blob = new Blob([JSON.stringify(jsonToDownload.value)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'biologicalAssociations.json';
        link.click();
        
        URL.revokeObjectURL(url);
      }
      
      function flattenObject(ob) {
        var toReturn = {};
        
        for (var i in ob) {
            if (!ob.hasOwnProperty(i)) continue;
            
            if ((typeof ob[i]) == 'object' && ob[i] !== null) {
                var flatObject = flattenObject(ob[i]);
                for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue;
                    
                    toReturn[i + '.' + x] = flatObject[x];
                }
            } else {
                toReturn[i] = ob[i];
            }
        }
        return toReturn;
      };
      
      function objectToTabDelimited(obj) {
        const fields = Object.keys(obj);
        const tsvData = fields.map(fieldName => `${fieldName}\t${obj[fieldName]}`);
        return tsvData.join('\r\n');
      };
      
      const downloadTSV = () => {      
        const flatObject = flattenObject(jsonToDownload.value);
        const tsvData = objectToTabDelimited(flatObject);
                
        const blob = new Blob([tsvData], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'biologicalAssociations.tsv';
        link.click();
        
        URL.revokeObjectURL(url);
      }
      
      return { 
        ...toRefs(state),
        baReferences,
        downloadJSON,
        flattenObject,
        objectToTabDelimited,
        downloadTSV,
        jsonToDownload,
        biologicalAssociationsJson,
        groupedSortedBiologicalAssociations,
        familyName
      };
    }
  }
</script>