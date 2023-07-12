<script>
  import { useRoute } from 'vue-router';
  export default {
  setup() {
    const route = useRoute();
    const taxonID = route.params.taxonID;

    return {
      taxonID
    };
  }
}
</script>

<template>
  
  <div>
    <h1>Universal Chalcidoidea Database</h1>
    <p><strong>About chalcids:</strong> Described as "gem-like inhabitants of the woodlands by most never seen nor dreamt of", chalcidoids include some of the most beautiful insects on the planet, but are amongst some of the most poorly known. They exhibit amazingly diverse life histories and profoundly influence all types of ecosytems, from rainforests to agriculture. Many species are natural enemies of insect pests and are used instead of pesticides to control them. As many as half a million species may exist, but only about 22,000 are documented, largely because chalcidoids are small to minute in size. The group includes the world's smallest adult insect, the degenerate male of <router-link :to="{ path: '/taxon', query: { taxonID: 471092 }}"><i>Dicopomorpha echmepterygis</i></router-link>, which is only a staggering 0.13mm long.</p>
    
    <p><strong>History of the database:</strong> The Universal Chalcidoidea Database (UCD) contains original citations for all 31,000  taxonomic names made available within the Chalcidoidea. It also includes a comprehensive list of the various generic combinations and misspellings that have been used in the literature. In all nearly 50,000 different combinations and spellings are recorded. All names are supported by a citation of the published source from where they were obtained as are all taxonomic and nomenclatural acts noted within the database. Also included are over 120,000 host/associate records (including associations with food plants of the hosts) and more than 140,000 distribution records. The latter can be used to provide regional lists of Chalcidoidea.</p>
    
    <p>The UCD has its roots in a taxonomic card catalog compiled and maintained until about 1969 by the "indexing section" of the Department of Entomology at The Natural History Museum, London. Soon after joining the staff of the department John Noyes undertook to update and improve on this catalog and add a comprehensive bibliography of works on the superfamily. The conversion of the card catalog into an electronic database was started in August 1991. It was made publically available through the UCD website by the Natural History Museum, London, with the last data update in 2019. The database was transferred to a new host: TaxonWorks, which provides the API used to build this site. The new UCD curator platform has been enhanced and now updated by multiple individuals from a number of different institutions worldwide.</p>
    
    <p>UCD content is licensed under a <a href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution License</a>. We encourage use of UCD images. In print, each image must include attribution to its photographer, the specimen code of the image, and "from www.ucd.chalcid.org" in each figure caption. For websites, images must include photographer attribution and be clearly identified as coming from www.ucd.chalcid.org, with a backward link to the respective source page.</p>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 600;
  font-size: 2.0rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}
</style>