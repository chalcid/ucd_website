<!-- This is a row of links that should be positioned below the banner and above any other interactive items-->

<template>
    <div class="row" name="linkRowContainer">
        <ul class = "nav">
          <li class="nav-item">
              <router-link :to ="{name: 'Home'} " class="nav-link">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link :to ="{name: 'BinomialSearch'} " class="nav-link">Search names</router-link>
            </li>
            <li class="nav-item">
              <router-link :to ="{name: 'AssociatesSearch'} " class="nav-link">Search associates</router-link>
            </li>
            <li class="nav-item">
              <router-link :to ="{name: 'DistributionSearch'} " class="nav-link">Browse by country</router-link>
            </li>
            <li class="nav-item">
              <router-link :to ="{name: 'TaxonomicTree'} " class="nav-link">Taxonomic Tree</router-link>
            </li>
        </ul>
    </div>
</template>