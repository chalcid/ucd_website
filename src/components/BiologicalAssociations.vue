<template>
  <div v-if="loading === true">
    <img src="/bars-rotate-fade.svg" alt="Loading...">
  </div>
  <div v-else></div>
    <div v-if="groupedBiologicalAssociations.length">
      <div class="row" ref="containerOfBiologicalAssociations" name="biologicalAssociationsContainer">
        <div class="col-12 bd-highlight align-items-start" id="biologicalAssociations-list-div" ref="biologicalAssociationsList">
          <button class="btn btn-link" type="button" @click="showBiologicalAssociations = !showBiologicalAssociations" aria-expanded="false">
            <font-awesome-icon :icon="showBiologicalAssociations ? 'angle-down' : 'angle-right'" />
            <span v-show="!showBiologicalAssociations"> Show biological associations</span>
            <span v-show="showBiologicalAssociations"> Biological associations</span>
          </button>
          <button class="btn btn-outline-primary" id="outline-button" v-show="showBiologicalAssociations" @click="downloadJSON" title="Java Script Object Notation, well-structured format">download (JSON)</button>  <button class="btn btn-outline-primary" id="outline-button" v-show="showBiologicalAssociations" @click="downloadTSV('Biological association data')" title="Tab Separated Values, simple format">download (TSV)</button>
          <div id="collapseBiologicalAssociations" v-show="showBiologicalAssociations">
            <div id = "showIfQuery" v-if="groupedBiologicalAssociations">
              <div v-for="(group, groupingFamily) in groupedBiologicalAssociations" :key="groupingFamily">
                <h5 class="indent">{{ group[0] ? group[0] : 'Others' }}</h5>
                <ul id="results-list-span">
                  <li id="sources-list-item" v-for="(association, index) in group[1]" :key="index" v-html="association.associationText"></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <references :bar-Prop="baReferences" :tn-Prop="tnProp"></references>
    </div>
    <div class="indent"></div>
  
</template>

<script>
  import { computed, reactive, ref, toRefs, onMounted } from 'vue'
  import api from '/api.js'
  import References from './References.vue';
  import CalmingWheel from './CalmingWheel.vue';

  export default {
    name: 'BiologicalAssociations',
    
    props: {
      baProp: String,
      faProp: String,
      tidProp: Array,
      tnProp: String
    },
    
    components: {
      References,
      CalmingWheel
    },
    
    setup(props) {
      const state = reactive({
        showBiologicalAssociations: false,
        biologicalAssociationsJson: [],
        baReferences: [],
        loading: true,
        arrayInJson: []
      });
      
      const jsonToDownload = ref(null);
      const familyName = ref(props.faProp);
      
      const sortedBiologicalAssociations = computed(() => {
        return state.biologicalAssociationsJson
          .filter(association => association.biological_relationship.name !== "compared with")
          .filter(association => association.object.object_tag)
          .map(association => {
            const citation = association.citations?.length? association.citations
              .map(citation => citation.citation_source_body)
              .sort()
              .join("; ")
              : 'No citation';
            const objectTag = association.object.object_tag.replace(" &#10003;", "").replace(" &#10060;", "").replace(" [c]", "");
            const relationship = association.biological_relationship.object_label.toLowerCase();
            const object = association.object.object_label;
            const subject = association.subject.object_tag.replace(" &#10003;", "").replace(" &#10060;", "").replace(" [c]", "");
            const groupingFamily = 
              association.object.taxonomy.family !== familyName.value ? association.object.taxonomy.family :
              association.subject.taxonomy.family !== familyName.value ? association.subject.taxonomy.family :
              familyName.value;
              
            return {
              associationText: `${objectTag} is a ${relationship} of ${subject}, (${citation})`.replace("a associate", "an associate"),
              groupingFamily: groupingFamily,
              objectName: object
            }
          });
      });
      
      const groupedBiologicalAssociations = computed(() => {
        const groupMap = new Map();

        for (const association of sortedBiologicalAssociations.value) {
          const family = association.groupingFamily || 'Other';

          if (!groupMap.has(family)) {
            groupMap.set(family, []);
          }
          groupMap.get(family).push(association);
        }

        const groupedArray = Array.from(groupMap.entries()).map(([family, items]) => {
          items.sort((a, b) => a.objectName.localeCompare(b.objectName));
          return [family, items];
        });

        groupedArray.sort(([famA], [famB]) => {
          const getRank = (family) => {
            if (family === 'Other') return 1;
            if (family?.endsWith('dae')) return 0;
            return 2;
          };

          const rankA = getRank(famA);
          const rankB = getRank(famB);

          if (rankA !== rankB) return rankA - rankB;
          return famA.localeCompare(famB);
        });

        return groupedArray;
      });
      
      const baReferences = computed(() => {
        const references = state.biologicalAssociationsJson.flatMap(item => item.citations.flatMap(citation => citation.source.object_tag + " Citation page(s): " + citation.pages));
        jsonToDownload.value["Biological association references"] = references;
        return references.sort();
      });
      
      onMounted(async () => {         
        jsonToDownload.value = {
          "Biological association data": [],
          "Biological association references": []
        };
        
        var baResponse = await api.get(`/biological_associations`,
          {params: {
            taxon_name_id: props.baProp,
            extend: ["object", "subject", "biological_relationship", "taxonomy", "biological_relationship_types", "citations", "source"],
            per: "10000",
            descendants: "true",
            project_token: import.meta.env.VITE_APP_PROJECT_TOKEN,
          }}
        );
        if(!baResponse.data[0]){
          console.log("baResponse.data.length = " & baResponse.data.length);
          baResponse = [];
          baResponse = await api.get(`/biological_associations`,
            {params: {
              taxon_name_id: props.tidProp,
              extend: ["object", "subject", "biological_relationship", "taxonomy", "biological_relationship_types", "citations", "source"],
              per: "10000",
              descendants: "true",
              project_token: import.meta.env.VITE_APP_PROJECT_TOKEN,
            }}
          );
        }
        const newData = await baResponse.data;
        state.biologicalAssociationsJson = await newData;
        jsonToDownload.value["Biological association data"] = state.biologicalAssociationsJson;
        if(await newData){
          state.loading = false;
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
      
      //For tsv formation so that it's not cluttered:
      const keysToExtract = [
        'id', 
        'biological_association_subject_id', 
        'biological_association_object_id', 
        'global_id', 
        'biological_relationship.name', 
        'biological_relationship.object_tag', 
        'biological_relationship.object_label', 
        'subject.id', 
        'subject.object_label', 
        'subject.taxonomy.kingdom', 
        'subject.taxonomy.phylum', 
        'subject.taxonomy.class', 
        'subject.taxonomy.order', 
        'subject.taxonomy.superfamily', 
        'subject.taxonomy.family', 
        'subject.taxonomy.subfamily', 
        'subject.taxonomy.tribe', 
        'subject.taxonomy.genus', 
        'subject.taxonomy.species', 
        'object.object_label', 
        'object.taxonomy.kingdom', 
        'object.taxonomy.family', 
        'object.taxonomy.genus', 
        'object.taxonomy.species'
      ];
      
      function flattenObject(ob, parentKey = '', result = {}) {
        for (var key in ob) {
          if (ob.hasOwnProperty(key)) {
            const newKey = parentKey ? `${parentKey}.${key}` : key;
            if (typeof ob[key] === 'object' && ob[key] !== null && !Array.isArray(ob[key])) {
              flattenObject(ob[key], newKey, result);
            } else if (Array.isArray(ob[key])) {
              if (ob[key].length === 2 && ob[key][0] === null) {
                result[newKey] = ob[key][1];
              } else {
                result[newKey] = ob[key].join(',');
              }
            } else {
              result[newKey] = ob[key];
            }
          }
        }
        return result;
      }
      
      function filterKeys(flattenedObj, keysToExtract) {
        let filtered = {};
        for (let key of keysToExtract) {
          filtered[key] = flattenedObj[key] || '';
        }
        return filtered;
      }
      
      function jsonToTsv(json, keysToExtract) {
        const flattenedJson = json.map(item => filterKeys(flattenObject(item), keysToExtract));
        const keys = keysToExtract;
        const tsv = [
          keys.join('\t'),
          ...flattenedJson.map(row => keys.map(key => row[key]).join('\t'))
        ].join('\n');

        return tsv;
      }
       
      const downloadTSV = (key) => {
        var arrayInJson = jsonToDownload.value[key];
        if (arrayInJson) {
          var tsv = jsonToTsv(arrayInJson, keysToExtract);
          if (tsv) {
            var filename = `${props.tnProp}_${key}.tsv`;
            var blob = new Blob([tsv], {type: 'text/tab-separated-values' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
          else {
            console.log(`Expected array but got ${typeof tsv}`)
          }
        }
        else {
          console.log(`Expected array but got ${typeof arrayInJson}`)
        }
      };
      
      return { 
        ...toRefs(state),
        sortedBiologicalAssociations,
        baReferences,
        downloadJSON,
        keysToExtract,
        flattenObject,
        downloadTSV,
        jsonToDownload,
        familyName,
        groupedBiologicalAssociations
      };
    }
  }
</script>