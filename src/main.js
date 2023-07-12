import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import Everything from './components/Everything.vue';
import HomePage from './components/HomePage.vue';
import BinomialSearch from './components/BinomialSearch.vue';
import TaxonPage from './components/TaxonPage.vue';
import SearchResults from './components/SearchResults.vue';
import BiologicalAssociations from './components/BiologicalAssociations.vue';
import References from './components/References.vue';
import TaxonDistribution from './components/TaxonDistribution.vue';
import AssociatesSearch from './components/AssociatesSearch.vue';
import DistributionSearch from './components/DistributionSearch.vue';
import KeywordSearch from './components/KeywordSearch.vue';
import TaxonomicTree from './components/TaxonomicTree.vue';
import './assets/main.css';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faAngleDown, faAngleRight, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(faAngleDown, faAngleRight);

const routes = [{
        path:'/everything',
        name: 'Everything',
        component: Everything
    },
    {
        path: '/',
        name: 'Home',
        meta: {title: 'UCD: Home Page'},
        component: HomePage
    },
    {
        path: '/binomialSearch',
        name: 'BinomialSearch',
        meta: {title: 'UCD: Binomial Search'},
        component: BinomialSearch
    },
    {
        path: '/taxon/:taxonID',
        component: TaxonPage,
        meta: { title: 'UCD: Taxon Page' },
        props: true
    },
    {
        path: '/taxon',
        name: 'TaxonPage',
        component: TaxonPage
    },
    {
        path: '/searchResults',
        name: 'SearchResults',
        component: SearchResults,
        props: true
    },
    {
        path: '/biologicalAssociations',
        name: 'BiologicalAssociations',
        component: BiologicalAssociations
    },
    {
        path: '/taxonDistribution',
        name: 'TaxonDistribution',
        component: TaxonDistribution
    },
    {
        path: '/references',
        name: 'References',
        component: References
    },
    {
        path: '/associatesSearch',
        name: 'AssociatesSearch',
        component: AssociatesSearch
    },
    {
        path: '/distributionSearch',
        name: 'DistributionSearch',
        meta: {title: 'UCD: Browse taxon distribution'},
        component: DistributionSearch
    },
    {
        path: '/keywordSearch',
        name: 'KeywordSearch',
        component: KeywordSearch
    },
    {
        path: '/taxonomicTree',
        name: 'TaxonomicTree',
        meta: {title: 'UCD: Taxonomic tree'},
        component: TaxonomicTree
    }
];
const router = createRouter({
    history: createWebHashHistory(),
    routes
});
const app = createApp(App);
app.use(router);
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount('#app');
router.beforeEach((to, from, next) => {
    document.title = to.meta.title ? to.meta.title : 'Universal Chalcidoidea Database';
    next();
})