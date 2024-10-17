<!-- This is a row of links that should be positioned below the banner and above any other interactive items-->

<template>
    <div class="link-row">
        <ul class = "nav">
          <li class="nav-item">
              <router-link :to ="{name: 'Home'} " class="nav-link">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link :to ="{name: 'BinomialSearch'} " class="nav-link">Search names</router-link>
            </li>
            <!--<li class="nav-item">
              <router-link :to ="{name: 'AssociatesSearch'} " class="nav-link">Search associates</router-link>
            </li>-->
            <li class="nav-item">
              <router-link :to ="{name: 'DistributionSearch'} " class="nav-link">Browse by country</router-link>
            </li>
            <li class="nav-item">
              <router-link :to ="{name: 'TaxonomicTree', query: {rootTaxonID: '455458', rootTaxonName: 'Chalcidoidea'}} " class="nav-link">Taxonomic Tree</router-link>
            </li>
            <li class="nav-item">
              <router-link :to ="{name: 'SourcesSearch'} " class="nav-link">Search references</router-link>
            </li>
        </ul>
    </div>
</template>