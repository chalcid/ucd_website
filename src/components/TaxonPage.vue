<template v-slot:taxonPage>
  <div>
    <span 
      v-for="(breadcrumb, index) in reversedBreadcrumbs"
        :key="breadcrumb.id"
        :class="{ italicizeBreadcrumb: breadcrumb.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Subgenus' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species' || breadcrumb.rank_string === 'NomenclaturalRank::Icn::GenusGroup::Genus' || breadcrumb.rank_string === 'NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Species' }">
        <router-link :to="{ name: 'TaxonPage', query: { taxonID: breadcrumb.id }}" v-if="breadcrumb.rank_string === 'NomenclaturalRank::Iczn::FamilyGroup::Family' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::FamilyGroup::Subfamily' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::FamilyGroup::Tribe' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::FamilyGroup::Subtribe' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Subgenus' || breadcrumb.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species' || breadcrumb.rank_string === 'NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Species' || breadcrumb.rank_string === 'NomenclaturalRank::Icn::GenusGroup::Genus'">
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
      <h3 v-if="italicized && taxonViewed[0] && taxonViewed[0].cached_is_valid===true">
        <span v-if="taxonViewed[0].cached_html" v-html="cachedNameString"></span>
        <span v-else><i>{{ taxonViewed[0].cached }}</i> {{ taxonViewed[0].cached_author_year }}</span>
      </h3>
      <h3 v-else-if="italicized && taxonViewed[0] && taxonViewed[0].cached_is_valid===false && validified">
        <span v-if="taxonViewed[0].cached_html" v-html="cachedNameString"></span>
        <span v-else v-html="validified.cached_html + '(' + taxonViewed[0].cached_author_year + ')'"></span>
      </h3>
      <h3 v-else-if="italicized && taxonViewed[0] && taxonViewed[0].cached_is_valid===false">
        <span v-if="taxonViewed[0].cached_html" v-html="cachedNameString"></span>
        <span v-else v-html="validified.cached_html + '(' + taxonViewed[0].cached_author_year + ')'"></span>
      </h3>
      <h3 v-else-if="taxonViewed[0] && taxonViewed[0].cached_is_valid===true">{{ taxonViewed[0].cached }} {{ taxonViewed[0].cached_author_year }}</h3>
      <h3 v-else-if="taxonViewed[0] && taxonViewed[0].cached_is_valid===false" v-html="cachedNameString"></h3>
      <span v-else></span>
      <span v-if="italicized && taxonViewed[0] && taxonViewed[0].cached_is_valid===false"><h5>Invalid name. Valid name: <router-link :to="{ name: 'TaxonPage', query: { taxonID: validified.id }}"><i>{{ validified.cached }}</i> {{ validified.cached_author_year }}</router-link></h5></span>
      <span v-else-if="taxonViewed[0] && taxonViewed[0].cached_is_valid===false"><h3></h3><h5>Invalid name. Valid name: <router-link :to="{ name: 'TaxonPage', query: { taxonID: validified.id }}">{{ validified.cached }} {{ validified.cached_author_year }}</router-link></h5></span>
    </div>
  </div>
  <div class="row">
    <div class="col-md-8" id="stationaryDiv">
      <fieldset>
        <div class="indent">
          <input type="radio" id="taxonomic-history" value="history" v-model="toggleTree" />
          <label class="padding-left-and-right" for="descendant-tree">See taxonomic history</label>
          <input type="radio" id="descendant-tree" value="tree" v-model="toggleTree" />
          <label class="padding-left" for="taxonomic-history">See included taxa</label>
        </div>
      </fieldset>
      <taxonomic-tree v-show="toggleTree === 'tree'" v-if="taxonViewed[0]" class="space-above"></taxonomic-tree>
      <div v-show="toggleTree === 'history'" ref="containerOfSynonyms" name="taxonPageSynonymsContainer">
        <div class="col-12 bd-highlight align-items-start" ref="resultsList">
          <button class="btn btn-link" type="button" @click="showSynonyms = !showSynonyms" aria-expanded="false">
            <font-awesome-icon :icon="showSynonyms ? 'angle-down' : 'angle-right'" />
            <span v-show="!showSynonyms"> Show taxonomic history</span>
            <span v-show="showSynonyms"> Taxonomic history</span>
          </button>
          <!-- <button class="btn btn-outline-primary" id="outline-button" v-show="showSynonyms" @click="downloadJSON" title="Java Script Object Notation, well-structured format">download (JSON)</button>  <button class="btn btn-outline-primary" id="outline-button" v-show="showSynonyms" @click="downloadTSV('Nomenclature data')" title="Tab Separated Values, simple format">download (TSV)</button> -->
          <div id="collapseSynonyms" v-show="showSynonyms">
            <div id="showIfQuery" v-if="resultsExist">
              <ul v-if="synonymArray" id="results-list-span">
                <li id="results-list-item" v-for="tag in synonymArray.timeline" :key="tag" v-html="tag.label"></li>
              </ul>
              <div class="indent" v-show="rankString==='NomenclaturalRank::Iczn::SpeciesGroup::Species' || isCombination === true">{{ concatenatedTypeInfo }}</div>
              <div class="indent" v-show="rankString==='NomenclaturalRank::Iczn::GenusGroup::Genus' || rankString==='NomenclaturalRank::Iczn::GenusGroup::Subgenus'">Type species: <router-link :to="{ name: 'TaxonPage', query: { taxonID: typeID }}" v-if="typeID"> <span v-html="concatenatedTypeInfo"></span></router-link></div>
              <div class="indent" v-show="rankString==='NomenclaturalRank::Iczn::FamilyGroup::Family' || rankString==='NomenclaturalRank::Iczn::FamilyGroup::Subfamily' || rankString==='NomenclaturalRank::Iczn::FamilyGroup::Tribe' || rankString==='NomenclaturalRank::Iczn::FamilyGroup::Subtribe'">Type genus: <router-link :to="{ name: 'TaxonPage', query: { taxonID: typeID }}" v-if="typeID"> <span v-html="concatenatedTypeInfo"></span></router-link></div>
            </div>
            <div id="showIfNoQuery" v-else>
              No search has been made
            </div>
          </div>
        </div>
    </div>
    <references v-show="toggleTree === 'history'" v-if="nomenclaturalReferencesResults && taxonViewed.length" :nr-Prop="nomenclaturalReferencesResults" :tn-Prop="taxonViewed[0].cached"></references>
    <div v-if="isTaxonIDChainPopulated">
      <biological-associations v-if="taxonIDChain && taxonIDChain.length > 0 && (isCombination === true || rankString === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || rankString === 'NomenclaturalRank::Iczn::SpeciesGroup::Species' || rankString === 'NomenclaturalRank::Icn::GenusGroup::Genus' || rankString === 'NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Species')" :ba-Prop="route.query.taxonID" :fa-Prop="familyName" :tn-Prop="taxonViewed[0].cached" :tid-prop="taxonIDChain"></biological-associations>
    </div>
      <div v-else><img src="/spinning-circles.svg" alt="Loading..." width="75"></div>
    </div>
    
    <div v-show="isTaxonIDChainPopulated" class="col-md-4" id="movingDiv">
      <!-- <images v-if="taxonIDChain && taxonIDChain.length > 0" :ba-Prop="taxonIDChain" class="space-below"></images> -->
      <div v-if="isCombination === true || rankString === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || rankString === 'NomenclaturalRank::Iczn::GenusGroup::Subgenus' || rankString === 'NomenclaturalRank::Iczn::SpeciesGroup::Species'"><taxon-distribution v-if="taxonIDChain && taxonIDChain.length > 0" :ba-Prop="taxonIDChain" :otu-Prop="otu" :tn-Prop="taxonViewed[0].cached"></taxon-distribution></div>
    </div>
  </div>
</template>

<style scoped>
h3{
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
</style>
  
<script>
  import { onMounted, reactive, computed, ref, toRefs, watch } from 'vue';
  import api from '/api.js';
  import BiologicalAssociations from './BiologicalAssociations.vue';
  import References from "./References.vue";
  import TaxonDistribution from "./TaxonDistribution.vue";
  import TaxonomicTree from './TaxonomicTree.vue';
  import Images from './Images.vue';
  import { useRoute } from 'vue-router';
  
  export default {
    name: 'TaxonPage',
    
    components: {
      BiologicalAssociations,
      References,
      TaxonDistribution,
      TaxonomicTree,
      Images
    },
    
    setup() {
      const state = reactive({
        showSynonyms: true,
        validified: [],
        toggleTree: "history",
        isCombination: false
      })
      
      const route = useRoute();
      const taxonID = ref('');
      const rankString = ref('');
      const concatenatedTypeInfo = ref('');
      const typeID = ref('');
      const taxonViewed = ref([]);
      const reversedBreadcrumbs = ref([]);
      const synonymArray = ref([]);
      const isTaxonIDChainPopulated = ref(false);
      const taxonIDChain =  ref([]);
      const jsonToDownload = ref(null);
      const otu = ref('');
      const cachedNameString = ref('');
      const validTaxonID = ref('');
      const oldTaxonID =  ref('');
      const gettingType = ref(false);
      
      const nomenclaturalReferencesResults = computed(() => {
        if (!synonymArray.value.sources) {
          return [];
        }
        return synonymArray.value.sources.map(ref => ref.cached);
      });
      
      const italicized = computed(() => {
        if(taxonViewed.value && taxonViewed.value[0]) {
          return ['NomenclaturalRank::Iczn::GenusGroup::Genus', 'NomenclaturalRank::Iczn::GenusGroup::Subgenus', 'NomenclaturalRank::Iczn::SpeciesGroup::Species', 'NomenclaturalRank::Iczn::SpeciesGroup::Subspecies', 'NomenclaturalRank::Icn::GenusGroup::Genus', 'NomenclaturalRank::Icn::GenusGroup::Subgenus', 'NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Species', 'NomenclaturalRank::Icn::SpeciesAndInfraspeciesGroup::Subspecies'].includes(rankString.value);
        };
        return false;
      });
      
      const familyName = computed(() => {
        const familyNameExtracted = reversedBreadcrumbs.value.find(item => item.rank_string === "NomenclaturalRank::Iczn::FamilyGroup::Family" || item.rank_string === "NomenclaturalRank::Icn::FamilyGroup::Family");
        return familyNameExtracted ? familyNameExtracted.name : taxonViewed.value[0].cached;
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
        
        taxonID.value = route.query.taxonID;
        if(taxonID.value) {
          await getTaxon(taxonID.value);
        };
        
        if (taxonViewed.value && taxonViewed.value[0] && taxonViewed.value[0].cached) {
          document.title = "UCD: " + taxonViewed.value[0].cached;
          if(taxonViewed.value[0].cached_html && taxonViewed.value[0].cached_author_year && state.isCombination===false) {
            cachedNameString.value = taxonViewed.value[0].cached_html + " " + taxonViewed.value[0].cached_author_year;
          }
          else {
            cachedNameString.value = taxonViewed.value[0].cached_html + " (" + taxonViewed.value[0].cached_author_year + ")";
          };
        };
        
        if(nomenclaturalReferencesResults){
          jsonToDownload.value["Nomenclature references"] = nomenclaturalReferencesResults.value;
        }
      });
                 
      const getTaxon = async (taxonNameID) => {
        if(gettingType.value === false) {
          const response = await api.get(`/taxon_names`,
              {params: {
                taxon_name_id: taxonNameID,
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
            }});
          taxonViewed.value = await response.data;
        
          if(await taxonViewed.value[0].type === 'Combination') {
            state.isCombination = true
            oldTaxonID.value = taxonViewed.value[0].id;
            validTaxonID.value = taxonViewed.value[0].cached_valid_taxon_name_id;
            const otuGet = await api.get(`/taxon_names/${validTaxonID.value}`,
              {params: {
                extend: ["otus"],
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
            }})
            state.validified = await otuGet.data;
            otu.value = await state.validified.otus[0].id.toString();
            validTaxonID.value = await state.validified.cached_valid_taxon_name_id;
          }
          else {
            rankString.value = taxonViewed.value[0].rank_string;
            const validifiedOtuGet = await api.get(`/taxon_names/${taxonNameID}`,
              {params: {
                extend: ["otus"],
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
            }})
            const validifiedOtuGetResponse = await validifiedOtuGet.data;
            state.validified = await validifiedOtuGetResponse;
            try {
              otu.value = await state.validified.otus[0].id.toString();
              validTaxonID.value = await state.validified.id;
            } catch (error) {
              console.log("Error retrieving this taxon. Does it exist in the database?")
            }
          };
          const combinedTaxonPromise = Promise.all ([
            api.get(`/taxon_names`,
              {params: {
                combination_taxon_name_id: [taxonNameID],
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
            }}),
            api.get(`/taxon_name_relationships`,
              {params: {
                object_taxon_name_id: taxonNameID,
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
            }}),
            api.get(`/taxon_names/${taxonNameID}`,
              {params: {
                extend: ['ancestor_ids'],
                project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
            }})
          ]);
          const [combinationsResponse, relationshipsResponse, breadcrumbs] = await combinedTaxonPromise;
          const combinationsResponseSynonyms = await combinationsResponse.data;
          const synonyms = await relationshipsResponse.data;
          const breadcrumbsData = await breadcrumbs.data;
          if (!rankString.value) {
            rankString.value = state.validified.rank_string;
            taxonViewed.value[0].cached_author_year = taxonViewed.value[0].cached_author_year.replace(/\(|\)/g, "");
            cachedNameString.value = state.validified.cached_html & " " & state.validified.cached_author_year;
            if(taxonViewed.value[0].type === 'Combination') {
              //state.isCombination = true;
              //validTaxonID.value = state.validified.cached_valid_taxon_name_id;
              //const getChiefOtu = 
            }
            else {
              console.log("The rank_string is null but the taxon name is not a combination");
            }
          }
          jsonToDownload.value["Nomenclature data"]["Taxon viewed"] = taxonViewed.value;
          jsonToDownload.value["Nomenclature data"]["Synonyms from taxon name combinations"] = await combinationsResponseSynonyms;
          jsonToDownload.value["Nomenclature data"]["Synonyms from taxon name relationships"] = await synonyms;
          await breadcrumbsNamer(breadcrumbsData);
          await typeInfo();
          await makeSynonyms(synonyms, combinationsResponseSynonyms);
        }
        else {
          const response = await api.get(`/taxon_names`,
            {params: {
              taxon_name_id: taxonNameID,
              project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
          }});
          const type = await response.data;
            return type;
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
          taxonIDChain.value.push(taxonID.value)
        }
        
        if(taxonIDChain.value.length > 0) {
          isTaxonIDChainPopulated.value = !isTaxonIDChainPopulated.value; 
        }

        const synonymResponse = await api.get(`/taxon_names/${taxonID.value}/inventory/catalog`,
          {params: {
            project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
        }});

        synonymArray.value = synonymResponse.data
      };
      
      const typeInfo = async () => {
        if(rankString.value === "NomenclaturalRank::Iczn::SpeciesGroup::Species" || state.isCombination === true){
          const response = await api.get(`/data_attributes`,
            {params: {
              attribute_subject_id: validTaxonID.value,
              project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
          }});
          const dataAttributesResults = response.data;
          jsonToDownload.value["Additional data"] = await dataAttributesResults;
          
          const extractedValues = await dataAttributesResults
            .filter(item => ['Species:PrimType', 'Species:TypeSex', 'Coll:Depository'].includes(item.predicate_name))
            .map(item => item.value === 'LT' ? 'Lectotype' : item.value === 'HT' ? 'Holotype' : item.value === 'ST' ? 'Syntypes' : item.value === 'NT' ? 'Neotype' : item.value === 'F' ? 'Female' : item.value === 'M' ? 'Male' : item.value, controlled_vocabulary_term_id => controlled_vocabulary_term_id);
          concatenatedTypeInfo.value = "Type information: " + extractedValues.join(", ");
        }
        else if(rankString.value === "NomenclaturalRank::Iczn::GenusGroup::Genus" || rankString.value === "NomenclaturalRank::Iczn::GenusGroup::Subgenus"){
          gettingType.value = true;
          const response = await api.get(`/taxon_name_relationships`,
            {params: {
              object_taxon_name_id: taxonID.value,
              project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
          }});
          const dataAttributesResults = response.data;
          jsonToDownload.value["Additional data"] = await dataAttributesResults;
          
          const extractedValues = dataAttributesResults.find(item => item.assignment_method.includes('type_of_genus'));
          if (extractedValues) {
            const subjectTaxonNameId = extractedValues.subject_taxon_name_id.toString();
            const typeSpecies = await getTaxon(subjectTaxonNameId);
            typeID.value = typeSpecies[0].id;
            concatenatedTypeInfo.value = typeSpecies[0].cached_original_combination_html + " " + typeSpecies[0].cached_author_year;
          };
        }
        else if(rankString.value === "NomenclaturalRank::Iczn::FamilyGroup::Family" || rankString.value === "NomenclaturalRank::Iczn::FamilyGroup::Subfamily" || rankString.value === "NomenclaturalRank::Iczn::FamilyGroup::Tribe" || rankString.value === "NomenclaturalRank::Iczn::FamilyGroup::Subtribe"){
          gettingType.value = true;
          const response = await api.get(`/taxon_name_relationships`,
            {params: {
              object_taxon_name_id: taxonID.value,
              project_token: import.meta.env.VITE_APP_PROJECT_TOKEN,
              per: 10000
          }});
          const dataAttributesResults = await response.data;
          jsonToDownload.value["Additional data"] = await dataAttributesResults;
          
          const extractedValues = await dataAttributesResults.find(item => item.assignment_method.includes('type_of_family'));
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
        let result = {};
        
        for (var i in ob) {
          if ((typeof ob[i]) === 'object' && !Array.isArray(ob[i])) {
            var temp = flattenObject(ob[i]);
            for (var j in temp) {
              result[i + '.' + j] = temp[j];
            }
          }
          else {
            result[i] = ob[i];
          }
        }
        return result;
      };
      
      function jsonToTsv(json) {
        var flattenedJson = json.map(item => flattenObject(item));
        var keys = Object.keys(flattenedJson[0]);
        var tsv = [
          keys.join('\t'),
          ...flattenedJson.map(row => keys.map(key => row[key]).join('\t'))
        ].join('\n');
      
        return tsv;
      };
       
      const downloadTSV = (key) => {
        var arrayInJson = jsonToDownload.value[key];
        if (arrayInJson) {
          var tsv = jsonToTsv(arrayInJson);
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
        route,
        taxonID,
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
        jsonToTsv,
        downloadTSV,
        flattenObject,
        familyName,
        otu,
        cachedNameString,
        validTaxonID,
        oldTaxonID
      };
    }
  }
</script>