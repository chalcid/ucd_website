<template>
  <ul>
    <li v-show="rootTaxonID === '455458'"><i>Note: be prepared to wait a few seconds if you choose a taxon with many descendants.</i></li>
    <li id="superfamily"><b> {{ rootTaxonName }} </b></li>
    <li v-for="firstDown in (trList[0] && trList[0].children ? trList[0].children : [])" :key="firstDown.id">
      <button v-show="firstDown.rank_string!='NomenclaturalRank::Iczn::SpeciesGroup::Species'" @click="toggleTaxon(firstDown)" id="treeButton">
        <span v-show="openTaxa[firstDown.id] === true">-</span>
        <span v-show="!openTaxa[firstDown.id] === true">+</span>
      </button>
      <a @click="displayTaxonPage(firstDown.id)" id="higherTaxon">
        <span v-if="firstDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || firstDown.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species' || firstDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Subgenus'">
          <i>{{ firstDown.name }}</i> <span v-show="firstDown.cached_author_year"> {{" " + firstDown.cached_author_year }} </span>
        </span>
        <span v-else>
          {{ firstDown.name + " " + firstDown.cached_author_year }}
        </span>
      </a>
      <ul v-show="openTaxa[firstDown.id] === true && firstDown.children">
        <li v-for="secondDown in firstDown.children" :key="secondDown.id">
          <button v-show="secondDown.rank_string!='NomenclaturalRank::Iczn::SpeciesGroup::Species'" @click="toggleTaxon(secondDown)" id="treeButton">
            <span v-show="openTaxa[secondDown.id] === true">-</span>
            <span v-show="!openTaxa[secondDown.id] === true">+</span>
          </button>
          <a @click="displayTaxonPage(secondDown.id), nothingClicked = !nothingClicked" class="normal-links" id="higherTaxon">
            <span v-if="secondDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || secondDown.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species' || firstDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Subgenus'">
              <i>{{ secondDown.name }}</i> <span v-show="secondDown.cached_author_year">{{" " + secondDown.cached_author_year }}</span>
            </span>
            <span v-else>
              {{ secondDown.name + " " + secondDown.cached_author_year }}
            </span>
          </a>
          <ul v-show="openTaxa[secondDown.id] === true && secondDown.children">
            <li v-for="thirdDown in secondDown.children" :key="thirdDown.id">
              <button v-show="thirdDown.rank_string!='NomenclaturalRank::Iczn::SpeciesGroup::Species'" @click="toggleTaxon(thirdDown)" id="treeButton">
                <span v-show="openTaxa[thirdDown.id] === true">-</span>
                <span v-show="!openTaxa[thirdDown.id] === true">+</span>
              </button>
              <a @click="displayTaxonPage(thirdDown.id), nothingClicked = !nothingClicked" class="normal-links" id="higherTaxon">
                <span v-if="thirdDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || thirdDown.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species' || firstDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Subgenus'">
                  <i> {{ thirdDown.name }} </i> <span v-show="thirdDown.cached_author_year"> {{" " + thirdDown.cached_author_year }} </span>
                </span>
                <span v-else>
                  {{ thirdDown.name + " " + thirdDown.cached_author_year }}
                </span>
              </a>
              <ul v-show="openTaxa[thirdDown.id] === true && thirdDown.children">
                <li v-for="fourthDown in thirdDown.children" :key="fourthDown.id">
                  <button v-show="fourthDown.rank_string!='NomenclaturalRank::Iczn::SpeciesGroup::Species'" @click="toggleTaxon(fourthDown)" id="treeButton">
                    <span v-show="openTaxa[fourthDown.id] === true">-</span>
                    <span v-show="!openTaxa[fourthDown.id] === true">+</span>
                  </button>
                  <a @click="displayTaxonPage(fourthDown.id), nothingClicked = !nothingClicked" id="species">
                    <span v-if="fourthDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || fourthDown.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species' || firstDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Subgenus'">
                      <i> {{ fourthDown.name }} </i> <span v-show="fourthDown.cached_author_year">{{" " + fourthDown.cached_author_year }} </span>
                    </span>
                    <span v-else>
                      {{ fourthDown.name + " " + fourthDown.cached_author_year }}
                    </span>
                  </a>
                  <ul v-show="openTaxa[fourthDown.id] === true && fourthDown.children">
                    <li v-for="fifthDown in fourthDown.children" :key="fifthDown.id">
                      <a @click="displayTaxonPage(fifthDown.id), nothingClicked = !nothingClicked" id="species" class="padding-left-twenty">
                        <span v-if="fifthDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || fifthDown.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species' || firstDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Subgenus'">
                          <i> {{ fifthDown.name }} </i> <span v-show="fifthDown.cached_author_year">{{" " + fifthDown.cached_author_year }} </span>
                        </span>
                        <span v-else>
                          {{ fifthDown.name + " " + fifthDown.cached_author_year}}
                        </span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>
</template>
  
<style scoped>
  ul {
    list-style-type: none;
  }

  ul ul {
    padding-left: 20px;
  }
</style>
  
<script>
  import { onMounted, reactive, toRefs, ref } from 'vue';
  import api from '/api.js'
  import { useRouter } from 'vue-router'
  
  export default {
    name: 'TaxonomicTree',
    
    setup() {
      const state = reactive({
        descendants: [],
        trList: [],
        openTaxa: {}
      });
      
      const taxonID = ref('');
      const router = useRouter();      
      const treeData = ref(null);
      const rootTaxonID = ref('');
      const rootTaxonName = ref('');
      
      onMounted(async () => {
        if (router) {
          rootTaxonID.value = router.currentRoute.value.query.rootTaxonID;
          rootTaxonName.value = router.currentRoute.value.query.rootTaxonName;
          if (rootTaxonID.value === undefined) {
            rootTaxonID.value = router.currentRoute.value.query.taxonID;
          }
          state.taxonID = rootTaxonID.value;
        }
        state.trList.push({id: state.taxonID, children: []});
        await getDescendants(state.taxonID);
      });
      
      const getDescendants = async (taxonID) => {
        const response = await api.get(`/taxon_names`, {
          params: {
          taxon_name_id: taxonID,
          descendants: true,
          descendants_max_depth: 1,
          validity: true,
          validify: true,
          per: 1000,
          project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
          },
        });
        const descendants = await response.data;
        
        const taxonIDInt = parseInt(taxonID);
        
        const filteredDescendants = await descendants
          .filter(item => item.id !== taxonIDInt)
          .sort((a, b) => a.name.localeCompare(b.name));
        
        const taxon = findTaxon(taxonID, state.trList);
        
        if(taxon) {
          taxon.children = filteredDescendants;
        }      
        
        state.openTaxa[taxonID] = true;
      };
      
      const findTaxon = (id, taxa) => {
        for (let i = 0; i < taxa.length; i++) {
          if (taxa[i].id === id) {
            return taxa[i];
          }
          if (taxa[i].children) {
            const found = findTaxon(id, taxa[i].children);
            if (found) {
              return found;
            }
          }
        }
        return null;
      }
      
      const toggleTaxon = async (taxon) => {
        if (state.openTaxa[taxon.id] === undefined) {
          await getDescendants(taxon.id);
        }
        else {
          state.openTaxa[taxon.id] = !state.openTaxa[taxon.id];
        }
      };
      
      const taxonClick = (clickedTaxon) => {
        taxonID.value = state.descendants.find(c => c.id === clickedTaxon);
      };
                              
      const splitText = (formatted) => {
        formatted = formatted.replace(/<\/?i>/g, '');
        const parts = formatted.split(/(\s|\[sic\])/).filter(part => part !== "");
        return parts.map(part => {
          if (part === "[sic]") {
            return {
              formatted: part,
              shouldItalicize: false
            }
          }
          const characters = part.split('');
          return characters.map(char => {
            return {
              formatted: char,
              shouldItalicize: char !== "(" && char !== ")"
            }
          });
        }).flat();
      };
            
      const displayTaxonPage = (taxonClicked) => {
        state.taxonClicked = taxonClicked;
        router.push({ name: 'TaxonPage', query: { taxonID: taxonClicked }});
        state.show = !state.show;
      };
  
      return { 
        ...toRefs(state),
        getDescendants,
        treeData,
        toggleTaxon,
        taxonClick,
        splitText,
        displayTaxonPage,
        rootTaxonID,
        rootTaxonName,
        taxonID
      };
    }
  };
</script>