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
    <p><strong>About chalcids</strong>: Described as "gem-like inhabitants of the woodlands by most never seen nor dreamt of", chalcidoids include some of the most beautiful insects on the planet, but are amongst some of the most poorly known. They exhibit amazingly diverse life histories and profoundly influence all types of ecosytems, from rainforests to agriculture. Many species are natural enemies of insect pests and are used instead of pesticides to control them. As many as half a million species may exist, but only about 22,000 are documented, largely because chalcidoids are small to minute in size. The group includes the world's smallest adult insect, the degenerate male of <router-link :to="{ path: '/taxon', query: { taxonID: 471092 }}"><i>Dicopomorpha echmepterygis</i></router-link>, which is only a staggering 0.13mm long.</p>
    
    <p><strong>Citation for web version</strong>: Universal Chalcidoidea Database Curators. 2022. Universal Chalcidoidea Database Web (UCDW) curated in TaxonWorks. www.ucd.chalcid.org. Accessed on [date].</p>
    
    <p><strong>Citation for database</strong>: Universal Chalcidoidea Database Curators. 2022. Universal Chalcidoidea Database (UCD) curated in TaxonWorks. https://sfg.taxonworks.org/api/v1/. Accessed on [date].</p>
    
    <p><strong>Why two citations?</strong> The UCDW is the public interface providing direct access to the curated data in the UCD Taxonworks interface. The UCD Taxonworks interface provides direct access to all of the data through a password protected interface. To get an overview of how the taxonworks interface works, we direct you to a series of video workshops starting with "1 TaxonWorks - The User Interface" (<a href="https://www.youtube.com/watch?v=SlaEhyLHkwk">https://www.youtube.com/watch?v=SlaEhyLHkwk</a>).</p>
    
    <p><strong>History of the database:</strong> The Universal Chalcidoidea Database (UCD) was first released as a CD-ROM in 1999, and it was first made available online in its previous version at the Natural History Museum website in 2002. It contains original citations for all 27,430 valid species and 2,213 genera within Chalcidoidea. It also includes a comprehensive list of the various generic combinations and misspellings that have been used in the literature. In all nearly 50,000 different combinations and spellings are recorded. All names are supported by a citation of the published source from where they were obtained as are all taxonomic and nomenclatural acts noted within the database. Also included are over 120,000 host/associate records (including associations with food plants of the hosts) and more than 140,000 distribution records. The latter can be used to provide regional lists of Chalcidoidea.</p>
    
    <p>The UCD has its roots in a taxonomic card catalog compiled and maintained until about 1969 by the "indexing section" of the Department of Entomology at The Natural History Museum, London. Soon after joining the staff of the department John Noyes undertook to update and improve on this catalog and add a comprehensive bibliography of works on the superfamily. The conversion of the card catalog into an electronic database was started in August 1991. It was made publically available through the UCD website by the Natural History Museum, London, with the last data update in 2019. The database was transferred to a new platform available in TaxonWorks, which provides the API used to build this site. The new UCD curator platform has been enhanced and is now updated by multiple individuals from a number of different institutions worldwide. This public interface exposes the data using an API that assembles updated information from the curator platform.</p>
    
    <p><strong>Curators</strong>: John Noyes was responsible for the enormous task of developing and curating the UCD up to 2019. For this we have only great admiration and thanks. A new curatorial group is now responsible for updating the database post 2019. To be added as a curator of taxonomic or biological data, please contact:</p>
    
    <ul class="ul-home-page"><strong>List of Active Curators</strong>:
      <li>Roger Burks Jr. (site designer) Newport Beach, CA, USA, burks.roger[at]gmail.com</li>
      <li>Lucian Fusu, 'Al. I. Cuza' University, Iasi, Romania</li>
      <li>D. Christopher Darling, Royal Ontario Museum, Toronto, ON, Canada</li>
      <li>John Heraty, University of California, Riverside, CA, USA</li>
      <li>Petr Janšta, Charles University, Prague, Czech Republic</li>
      <li>Mircea-Dan Mitroiu, 'Al. I. Cuza' University, Iasi, Romania</li>
      <li>Pâmella Machado Saguiah, Ciências Biológicas pela Universidade Federal do Espírito Santo, Brazil</li>
      <li>Natalie Dale-Skey, The Museum of Natural History, London, United Kingdom</li>
      <li>James B. Woolley, Texas A&M University, College Station, TX, USA</li>
    </ul>
    
    <p><strong>TaxonWorks Development and Outreach Team</strong>: Matt Yoder, Dmitry Dmitriev, José Luis Pereira, Hernán Lucas Pereira, Deborah Paul.</p>

    <p><strong>UCD content</strong> is licensed under a <a href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution License</a>.</p>
    
    <p><strong>Funding</strong> by the Tate &amp; Lyle PLC, Unilever, National Science Foundation Grant DEB-1555808, and a grant from the USDA Systematic Entomology Laboratory.</p>
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
