<template v-slot:taxonPage>
  <div>
    <span 
      v-for="(breadcrumb, index) in reversedBreadcrumbs"
        :key="breadcrumb.id"
        :class="{ italicizeBreadcrumb: breadcrumb.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species' || breadcrumb.rank_string === 'NomenclaturalRank::Icn::GenusGroup::Genus' || breadcrumb.rank_string === 'NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Species' }">
        <router-link :to="{ name: 'TaxonPage', query: { taxonID: breadcrumb.id }}" v-if="breadcrumb.rank_string === 'NomenclaturalRank::Iczn::FamilyGroup::Family' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::FamilyGroup::Subfamily' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::FamilyGroup::Tribe' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::FamilyGroup::Subtribe' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species' || breadcrumb.rank_string === 'NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Species' || breadcrumb.rank_string === 'NomenclaturalRank::Icn::GenusGroup::Genus'">
          {{ breadcrumb.name }}
        </router-link>
        <span v-else>
          {{ breadcrumb.name }}
        </span>
      <span v-if="index < reversedBreadcrumbs.length - 1"> > </span>
    </span>
  </div>
  <div class="row">
    <div class="col-12">
      <h3 v-if="italicized && taxonViewed[0] && taxonViewed[0].cached_is_valid===true"><i>{{ taxonViewed[0].cached }}</i> {{ taxonViewed[0].cached_author_year }}</h3>
      <h3 v-else-if="taxonViewed[0] && taxonViewed[0].cached_is_valid===true">{{ taxonViewed[0].cached }} {{ taxonViewed[0].cached_author_year }}</h3>
      <span v-else-if="italicized && taxonViewed[0] && validified[0] && taxonViewed[0].cached_is_valid===false"><h3><i>{{ taxonViewed[0].cached }}</i> {{ taxonViewed[0].cached_author_year }}</h3><h5>Invalid name. Valid name: <router-link :to="{ name: 'TaxonPage', query: { taxonID: validified[0].id }}"><i>{{ validified[0].cached }}</i> {{ validified[0].cached_author_year }}</router-link></h5></span>
      <span v-else-if="taxonViewed[0] && validified[0] && taxonViewed[0].cached_is_valid===false"><h3></h3><h5>Invalid name. Valid name: <i>{{ validified[0].cached }}</i> {{ validified[0].cached_author_year }}</h5></span>
      <span v-else></span>
    </div>
  </div>
  <div class="row">
    <div class="col-md-8" id="stationaryDiv">
      <div ref="containerOfSynonyms" name="taxonPageSynonymsContainer">
        <div class="col-12 bd-highlight align-items-start" ref="resultsList">
          <button class="btn btn-link" type="button" @click="showSynonyms = !showSynonyms" aria-expanded="false">
            <font-awesome-icon :icon="showSynonyms ? 'angle-down' : 'angle-right'" />
            <span v-show="!showSynonyms"> Show taxonomic history</span>
            <span v-show="showSynonyms"> Taxonomic history</span>
          </button>
          <button class="btn btn-outline-primary" id="outline-button" v-show="showSynonyms" @click="downloadJSON">download (JSON)</button>  <button class="btn btn-outline-primary" id="outline-button" v-show="showSynonyms" @click="downloadTSV">download (TSV)</button> 
          <div id="collapseSynonyms" v-show="showSynonyms">
            <div id="showIfQuery" v-if="resultsExist">
              <ul v-if="synonymArray" id="results-list-span">
                <li style="list-style-type:none" v-for="tag in synonymArray.timeline" :key="tag" v-html="tag.label"></li>
              </ul>
              <div class="indent" v-show="rankString==='NomenclaturalRank::Iczn::SpeciesGroup::Species' && concatenatedTypeInfo != 'Type information: '">{{ concatenatedTypeInfo }}</div>
              <div class="indent" v-show="rankString==='NomenclaturalRank::Iczn::GenusGroup::Genus' || rankString==='NomenclaturalRank::Iczn::GenusGroup::Subgenus'">Type species: <router-link :to="{ name: 'TaxonPage', query: { taxonID: typeID }}" v-if="typeID"> <span v-html="concatenatedTypeInfo"></span></router-link></div>
              <div class="indent" v-show="rankString==='NomenclaturalRank::Iczn::FamilyGroup::Family' || rankString==='NomenclaturalRank::Iczn::FamilyGroup::Subfamily' || rankString==='NomenclaturalRank::Iczn::FamilyGroup::Tribe' || rankString==='NomenclaturalRank::Iczn::FamilyGroup::Subtribe'">Type genus: <router-link :to="{ name: 'TaxonPage', query: { taxonID: typeID }}" v-if="typeID"> <span v-html="concatenatedTypeInfo"></span></router-link></div>
            </div>
            <div id="showIfNoQuery" v-else>
              No search has been made
            </div>
          </div>
        </div>
    </div>
    <references v-if="nomenclaturalReferencesResults" :nr-Prop="nomenclaturalReferencesResults"></references>
    <div v-if="isTaxonIDChainPopulated">
      <biological-associations :ba-Prop="taxonIDChain"></biological-associations>
    </div>
      <div v-else><img src="/spinning-circles.svg" alt="Loading..." width="75"></div>
    </div>
    
    <div class="col-md-4" id="movingDiv" v-if="taxonViewed[0] && (taxonViewed[0].rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || taxonViewed[0].rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species')">
      <div v-if="isTaxonIDChainPopulated"><taxon-distribution v-if="isTaxonIDChainPopulated" :ba-Prop="taxonIDChain"></taxon-distribution></div>
      <div v-else><img src="/spinning-circles.svg" alt="Loading..." width="75"></div>
    </div>
  </div>
</template>

<style scoped>
h3{
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
@media (min-width: 1537px) {
  #stationaryDiv {
    flex: 0 0 64%;
    max-width: 64%;
    padding-left: 0;
    padding-right: 0;
  }

  #movingDiv {
    flex: 0 0 33.33333%;
    max-width: 33.33333%;
    padding-left: 0;
    padding-right: 0;
  }
}

@media (max-width: 1536px) {
  #movingDiv {
    flex: max-content;
    max-width: 100%;
  }
}
</style>
  
<script>
  import { onMounted, reactive, computed, ref, toRefs } from 'vue'
  import api from '/api.js'
  import BiologicalAssociations from './BiologicalAssociations.vue'
  import References from "./References.vue"
  import TaxonDistribution from "./TaxonDistribution.vue"
  import { useRoute } from 'vue-router';
  
  export default {
    name: 'TaxonPage',
    
    components: {
      BiologicalAssociations,
      References,
      TaxonDistribution
    },
    
    setup() {
      const state = reactive({
        showSynonyms: true,
        validified: []
      })
      
      const route = useRoute();
      const taxonID = route.query.taxonID;
      
      const rankString = ref('');
      const concatenatedTypeInfo = ref('');
      const typeID = ref('');
      const taxonViewed = ref([]);
      const reversedBreadcrumbs = ref([]);
      const synonymArray = ref([]);
      const isTaxonIDChainPopulated = ref(false);
      const taxonIDChain =  ref([]);
      const jsonToDownload = ref(null);
      
      const nomenclaturalReferencesResults = computed(() => synonymArray.value.sources);
      
      const italicized = computed(() => {
        if(taxonViewed.value && taxonViewed.value[0]) {
          return ['NomenclaturalRank::Iczn::GenusGroup::Genus', 'NomenclaturalRank::Iczn::SpeciesGroup::Species', 'NomenclaturalRank::Icn::GenusGroup::Genus', 'NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Species'].includes(taxonViewed.value[0].rank_string);
        };
        return false;
      });
        
      const resultsExist = computed(() => route.query.taxonID !== undefined && route.query.taxonID !== null);
      
      onMounted(async () => {
        jsonToDownload.value = {
          "Nomenclature data": {
            "Taxon viewed": [],
            "Synonyms from taxon name combinations": [],
            "Synonyms from taxon name relationships": []
          },
          "Additional data": [],
          "Nomenclature references": [],
        };
        
        await getTaxon(taxonID);
        
        if (taxonViewed.value && taxonViewed.value[0] && taxonViewed.value[0].cached) {
          document.title = "UCD: " + taxonViewed.value[0].cached;
        };
        
        if(nomenclaturalReferencesResults){
          jsonToDownload.value["Nomenclature references"] = nomenclaturalReferencesResults.value;
        }
      });
      
      const getTaxon = async (taxonID) => {
        const response = await api.get(`/taxon_names`,
            {params: {
              taxon_name_id: taxonID,
              token: import.meta.env.VITE_APP_API_TOKEN,
              project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
        }});
        if(taxonViewed.value.length === 0) {
          taxonViewed.value = response.data
          rankString.value = taxonViewed.value[0].rank_string;
          const combinedTaxonPromise = Promise.all ([
            api.get(`/taxon_names`,
              {params: {
                combination_taxon_name_id: [taxonID],
                token: import.meta.env.VITE_APP_API_TOKEN,
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
            }}),
            api.get(`/taxon_name_relationships`,
              {params: {
                object_taxon_name_id: taxonID,
                token: import.meta.env.VITE_APP_API_TOKEN,
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
            }}),
            api.get(`/taxon_names/${taxonID}`,
              {params: {
                extend: ['ancestor_ids'],
                token: import.meta.env.VITE_APP_API_TOKEN,
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
            }}),
            api.get(`/taxon_names/`,
                    {params: {
                      taxon_name_id: taxonID,
                      validify: true,
                      token: import.meta.env.VITE_APP_API_TOKEN,
                      project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
            }})
          ]);
          const [combinationsResponse, relationshipsResponse, breadcrumbs, validify] = await combinedTaxonPromise;
          const combinationsResponseSynonyms = await combinationsResponse.data;
          const synonyms = await relationshipsResponse.data;
          const breadcrumbsData = await breadcrumbs.data;
          state.validified = await validify.data;
          
          jsonToDownload.value["Nomenclature data"]["Taxon viewed"] = taxonViewed.value;
          jsonToDownload.value["Nomenclature data"]["Synonyms from taxon name combinations"] = combinationsResponseSynonyms;
          jsonToDownload.value["Nomenclature data"]["Synonyms from taxon name relationships"] = synonyms;
          
          await breadcrumbsNamer(breadcrumbsData);
          await typeInfo();
          await makeSynonyms(synonyms, combinationsResponseSynonyms);
        }
        else {
          return await response.data;
        };
      };
      
      const makeSynonyms = async (synonyms, combinationsResponseSynonyms) => {
        synonyms = synonyms.filter(x => x.inverse_assignment_method === "iczn_subjective_synonym" || x.inverse_assignment_method === "iczn_misspelling" || x.inverse_assignment_method === "original_species" || x.inverse_assignment_method === "iczn_synonym" || x.inverse_assignment_method === "iczn_invalid");
        
        for (const taxonName of synonyms) {
          taxonIDChain.value.push(taxonName.subject_taxon_name_id.toString());
        };
        
        for (const taxonName of combinationsResponseSynonyms){
          taxonIDChain.value.push(taxonName.id.toString());
        }
        
        if(taxonIDChain.value.length === 0){
          taxonIDChain.value.push(taxonID)
        }
        
        if(taxonIDChain.value.length > 0) {
          isTaxonIDChainPopulated.value = !isTaxonIDChainPopulated.value; 
        }

        const synonymResponse = await api.get(`/taxon_names/${taxonID}/inventory/catalog`,
          {params: {
            token: import.meta.env.VITE_APP_API_TOKEN,
            project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
        }});

        synonymArray.value = synonymResponse.data
      };
      
      const typeInfo = async () => {
        if(rankString.value === "NomenclaturalRank::Iczn::SpeciesGroup::Species"){
          const response = await api.get(`/data_attributes`,
            {params: {
              attribute_subject_id: taxonID,
              token: import.meta.env.VITE_APP_API_TOKEN,
              project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
          }});
          const dataAttributesResults = response.data;
          jsonToDownload.value["Additional data"] = await dataAttributesResults;
          
          const extractedValues = dataAttributesResults
            .filter(item => ['Species:PrimType', 'Species:TypeSex', 'Coll:Depository'].includes(item.predicate_name))
            .map(item => item.value === 'LT' ? 'Lectotype' : item.value === 'HT' ? 'Holotype' : item.value === 'ST' ? 'Syntypes' : item.value === 'NT' ? 'Neotype' : item.value === 'F' ? 'Female' : item.value === 'M' ? 'Male' : item.value, controlled_vocabulary_term_id => controlled_vocabulary_term_id);
          concatenatedTypeInfo.value = "Type information: " + extractedValues.join(", ");
        }
        else if(rankString.value === "NomenclaturalRank::Iczn::GenusGroup::Genus" || rankString.value === "NomenclaturalRank::Iczn::GenusGroup::Subgenus"){
          const response = await api.get(`/taxon_name_relationships`,
            {params: {
              object_taxon_name_id: taxonID,
              token: import.meta.env.VITE_APP_API_TOKEN,
              project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
          }});
          const dataAttributesResults = response.data;
          jsonToDownload.value["Additional data"] = await dataAttributesResults;
          
          const extractedValues = dataAttributesResults
            .find(item => item.assignment_method.includes('type_of_genus'));
          if (extractedValues) {
            const subjectTaxonNameId = extractedValues.subject_taxon_name_id.toString();
            const typeSpecies = await getTaxon(subjectTaxonNameId);
            typeID.value = typeSpecies[0].id;
            concatenatedTypeInfo.value = typeSpecies[0].cached_original_combination_html + " " + typeSpecies[0].cached_author_year;
          };
        }
        else if(rankString.value === "NomenclaturalRank::Iczn::FamilyGroup::Family" || rankString.value === "NomenclaturalRank::Iczn::FamilyGroup::Subfamily" || rankString.value === "NomenclaturalRank::Iczn::FamilyGroup::Tribe" || rankString.value === "NomenclaturalRank::Iczn::FamilyGroup::Subtribe"){
          const response = await api.get(`/taxon_name_relationships`,
            {params: {
              object_taxon_name_id: taxonID,
              token: import.meta.env.VITE_APP_API_TOKEN,
              project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
          }});
          const dataAttributesResults = await response.data;
          jsonToDownload.value["Additional data"] = await dataAttributesResults;
          
          const extractedValues = await dataAttributesResults
            .find(item => item.assignment_method.includes('type_of_family'));
          if (extractedValues) {
            const subjectTaxonNameId = extractedValues.subject_taxon_name_id.toString();
            const typeGenus = await getTaxon(subjectTaxonNameId);
            typeID.value = typeGenus[0].id;
            concatenatedTypeInfo.value = typeGenus[0].cached_original_combination_html + " " + typeGenus[0].cached_author_year;
          };
        }
      };
      
      const breadcrumbsNamer = async (breadcrumbsData) => {
        const breadcrumbsIDs = [];
        for (const crumb in breadcrumbsData.ancestor_ids) {
            breadcrumbsIDs.push(breadcrumbsData.ancestor_ids[crumb][0])
        };
        const ancestorIDs = breadcrumbsIDs.filter(id => id !== undefined);
        const promises = ancestorIDs.map(id => api.get(`/taxon_names/${id}`,
          {params: {
            token: import.meta.env.VITE_APP_API_TOKEN,
            project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
        }}));
        const breadcrumbsResponse = await Promise.all(promises);
        const breadcrumbsNamerData = breadcrumbsResponse.map(breadcrumbsResponse => breadcrumbsResponse.data);
        reversedBreadcrumbs.value = [...breadcrumbsNamerData].reverse().slice(1);
      };
      
      const downloadJSON = () => {
        const blob = new Blob([JSON.stringify(jsonToDownload.value)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'taxonPage.json';
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
        link.download = 'taxonPage.tsv';
        link.click();
        
        URL.revokeObjectURL(url);
      }
      
      return {
        ...toRefs(state),
        route,
        nomenclaturalReferencesResults, 
        italicized, 
        resultsExist,
        breadcrumbsNamer,
        typeInfo,
        rankString,
        typeID,
        concatenatedTypeInfo,
        taxonViewed,
        makeSynonyms,
        reversedBreadcrumbs,
        synonymArray,
        isTaxonIDChainPopulated,
        taxonIDChain,
        jsonToDownload,
        downloadJSON,
        downloadTSV,
        objectToTabDelimited,
        flattenObject,
      };
    }
  }
</script>