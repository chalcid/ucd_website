<template>
    <div class="row">
      <div class="col-12" name="contentContainer">
        <BinomialSearch />
        <div v-show="state.taxonPageShow">
          <TaxonPage />
        </div>
      </div>
    </div>
  </template>
  
<script>
  import { reactive } from 'vue';
  import BinomialSearch from './BinomialSearch.vue';
  import TaxonPage from './TaxonPage.vue';
  
  const state = reactive({
      taxonPageShow: false
  })
  
  export default {
    components: {
      BinomialSearch,
      TaxonPage,
    },
  };
</script>