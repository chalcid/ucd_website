<template>
  <div v-if="sortedBiologicalAssociations[0]">
    <div class="row" ref="containerOfBiologicalAssociations" name="biologicalAssociationsContainer">
      <div class="col-12 bd-highlight align-items-start" id="biologicalAssociations-list-div" ref="biologicalAssociationsList">
        <button class="btn btn-link" type="button" @click="showBiologicalAssociations = !showBiologicalAssociations" aria-expanded="false">
          <font-awesome-icon :icon="showBiologicalAssociations ? 'angle-down' : 'angle-right'" />
          <span v-show="!showBiologicalAssociations"> Show biological associations</span>
          <span v-show="showBiologicalAssociations"> Biological associations</span>
        </button>
        <button class="btn btn-outline-primary" id="outline-button" v-show="showBiologicalAssociations" @click="downloadJSON">download (JSON)</button>  <button class="btn btn-outline-primary" id="outline-button" v-show="showBiologicalAssociations" @click="downloadTSV">download (TSV)</button>
        <div id="collapseBiologicalAssociations" v-show="showBiologicalAssociations">
          <div id = "showIfQuery" v-if="sortedBiologicalAssociations">
            <ul id="results-list-span">
              <li style="list-style-type:none" v-for="object_tag in sortedBiologicalAssociations" :key="object_tag" v-html="object_tag"></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <references :bar-Prop="baReferences"></references>
  </div>
  <div class="indent" v-else-if="sortedBiologicalAssociations.length === 0">No biological associations are databased for this taxon name.</div>
  <div v-else><img src="/spinning-circles.svg" alt="Loading..." width="75"></div>
</template>

<script>
  import { computed, reactive, ref, toRefs, onMounted, nextTick } from 'vue'
  import api from '/api.js'
  import References from './References.vue';

  export default {
    name: 'BiologicalAssociations',
    
    props: {
      baProp: Array
    },
    
    components: {
      References
    },
    
    setup(props) {
      const state = reactive({
        showBiologicalAssociations: true,
        biologicalAssociationsJson: [],
        baReferences: []
      });
      
      const jsonToDownload = ref(null);
      
      const sortedBiologicalAssociations = computed(() => {
        return state.biologicalAssociationsJson
          .filter(association => association.biological_relationship.name !== "compared with")
          .filter(association => association.object.object_tag)
          .map(association => {
            const citation = association.citations?.[0]?.citation_source_body || 'No citation';
            const objectTag = association.object.object_tag.replace(" &#10003;", "").replace(" &#10060;", "").replace(" [c]", "");
            const relationship = association.biological_relationship.object_label.toLowerCase();
            const subject = association.subject.object_tag.replace(" &#10003;", "").replace(" &#10060;", "").replace(" [c]", "");
            return `${objectTag} is a ${relationship} of ${subject}, (${citation})`.replace("a associate", "an associate");
          });
      });
      
      const baReferences = computed(() => {
        let references = state.biologicalAssociationsJson.flatMap(item => item.citations.map(citation => citation.source.object_tag));
        jsonToDownload.value["Biological association references"] = references;
        return references.sort();
      });
      
      onMounted(async () => {   
        nextTick();
        
        jsonToDownload.value = {
          "Biological association data": [],
          "Biological association references": []
        };
        
        const baResponse = await api.get(`/biological_associations`,
          {params: {
            taxon_name_id: props.baProp,
            extend: ["object", "subject", "biological_relationship", "taxonomy", "biological_relationship_types", "citations", "source"],
            per: "10000",
            descendants: "true",
            token: import.meta.env.VITE_APP_API_TOKEN,
            project_token: import.meta.env.VITE_APP_PROJECT_TOKEN,
          }}
        );
        let newData = await baResponse.data;
        state.biologicalAssociationsJson = await newData;
        jsonToDownload.value["Biological association data"] = state.biologicalAssociationsJson;
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
        let fields = Object.keys(obj);
        let tsvData = fields.map(fieldName => `${fieldName}\t${obj[fieldName]}`);
        return tsvData.join('\r\n');
      };
      
      const downloadTSV = () => {      
        let flatObject = flattenObject(jsonToDownload.value);
        let tsvData = objectToTabDelimited(flatObject);
                
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
        sortedBiologicalAssociations,
        baReferences,
        downloadJSON,
        flattenObject,
        objectToTabDelimited,
        downloadTSV,
        jsonToDownload
      };
    }
  }
</script>