<template>
  <ul>
    <li><i>Note: be prepared to wait a few seconds if you choose a taxon with many descendants.</i></li>
    <li id="superfamily"><b><a>Chalcidoidea</a></b></li>
    <li v-for="firstDown in (trList[0] && trList[0].children ? trList[0].children : [])" :key="firstDown.id">
      <button @click="toggleTaxon(firstDown)" id="treeButton">
        <span v-show="openTaxa[firstDown.id] === true">-</span>
        <span v-show="!openTaxa[firstDown.id] === true">+</span>
      </button>
      <a @click="displayTaxonPage(taxon.id)" id="higherTaxon">
        <span v-if="firstDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || firstDown.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species'">
          <i>{{ firstDown.name }}</i>
        </span>
        <span v-else>
          {{ firstDown.name }}
        </span>
      </a>
      <ul v-show="openTaxa[firstDown.id] === true && firstDown.children">
        <li v-for="secondDown in firstDown.children" :key="secondDown.id">
          <button v-show="secondDown.rank_string!='NomenclaturalRank::Iczn::SpeciesGroup::Species'" @click="toggleTaxon(secondDown)" id="treeButton">
            <span v-show="openTaxa[secondDown.id] === true">-</span>
            <span v-show="!openTaxa[secondDown.id] === true">+</span>
          </button>
          <a @click="displayTaxonPage(secondDown.id), nothingClicked = !nothingClicked" style="text-decoration:underline; color: var(--bs-link-color);" id="higherTaxon">
            <span v-if="secondDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || secondDown.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species'">
              <i>{{ secondDown.name }}</i>
            </span>
            <span v-else>
              {{ secondDown.name }}
            </span>
          </a>
          <ul v-show="openTaxa[secondDown.id] === true && secondDown.children">
            <li v-for="thirdDown in secondDown.children" :key="thirdDown.id">
              <button v-show="thirdDown.rank_string!='NomenclaturalRank::Iczn::SpeciesGroup::Species'" @click="toggleTaxon(thirdDown)" id="treeButton">
                <span v-show="openTaxa[thirdDown.id] === true">-</span>
                <span v-show="!openTaxa[thirdDown.id] === true">+</span>
              </button>
              <a @click="displayTaxonPage(thirdDown.id), nothingClicked = !nothingClicked" style="text-decoration:underline; color: var(--bs-link-color);" id="higherTaxon">
                <span v-if="thirdDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || thirdDown.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species'">
                  <i> {{ thirdDown.name }} </i>
                </span>
                <span v-else>
                  {{ thirdDown.name }}
                </span>
              </a>
              <ul v-show="openTaxa[thirdDown.id] === true && thirdDown.children">
                <li v-for="fourthDown in thirdDown.children" :key="fourthDown.id">
                  <button v-show="fourthDown.rank_string!='NomenclaturalRank::Iczn::SpeciesGroup::Species'" @click="toggleTaxon(fourthDown)" id="treeButton">
                    <span v-show="openTaxa[fourthDown.id] === true">-</span>
                    <span v-show="!openTaxa[fourthDown.id] === true">+</span>
                  </button>
                  <a @click="displayTaxonPage(fourthDown.id), nothingClicked = !nothingClicked" id="species">
                    <span v-if="fourthDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || fourthDown.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species'">
                      <i> {{ fourthDown.name }} </i>
                    </span>
                    <span v-else>
                      {{ fourthDown.name }}
                    </span>
                  </a>
                  <ul v-show="openTaxa[fourthDown.id] === true && fourthDown.children">
                    <li v-for="fifthDown in fourthDown.children" :key="fifthDown.id">
                      <a @click="displayTaxonPage(fifthDown.id), nothingClicked = !nothingClicked" id="species" style="padding-left: 20px;">
                        <span v-if="fifthDown.rank_string === 'NomenclaturalRank::Iczn::GenusGroup::Genus' || fifthDown.rank_string === 'NomenclaturalRank::Iczn::SpeciesGroup::Species'">
                          <i> {{ fifthDown.name }} </i>
                        </span>
                        <span v-else>
                          {{ fifthDown.name }}
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
  
  #treeButton {
    background-color: #ffffff;
    width: 19px;
    height: 19px;
    line-height: 5px;
    text-align: center;
    border: 1px solid black;
    font-size: small;
  }
  
  #treeButton:hover {
    background-color: rgb(134, 134, 134);
  }
  
  #species {
    padding-left: 10px;
    text-decoration:underline; 
    color: var(--bs-link-color)
  }
  
  #higherTaxon {
    padding-left: 5px;
    text-decoration:underline; 
    color: var(--bs-link-color)
  }
  
  #itemDescendant {
    padding-left: 20px;
  }
  
  #superfamily {
    font-size: larger;
  }
</style>
  
<script>
  import { onMounted, reactive, toRefs, ref } from 'vue';
  import api from '/api.js'
  import { useRouter } from 'vue-router'
  
  export default {
    name: 'TaxonomicTree',
    
    setup(props) {
      const state = reactive({
        descendants: [],
        taxonID: '',
        trList: [],
        treeResult: [],
        taxon: [],
        openTaxa: {}
      });
      
      const router = useRouter();      
      const treeData = ref(null);
      
      onMounted(async () => {
        const taxonID = 455458;
        state.trList.push({id: taxonID, children: []});
        await getDescendants(taxonID);
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
          token: import.meta.env.VITE_APP_API_TOKEN,
          project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
          },
        });
        const descendants = await response.data;
        
        const filteredDescendants = await descendants
          .filter(item => item.id !== taxonID)
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
        state.taxonID = state.descendants.find(c => c.id === clickedTaxon);
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
        displayTaxonPage
      };
    }
  };
</script>