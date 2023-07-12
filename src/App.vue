<script>
  import Everything from './components/Everything.vue';
  import LinkRow from './components/LinkRow.vue';
  
  export default {
    components: {
      Everything,
      LinkRow
    }
  }
</script>

<template>
  <div class="wholeHeight">
    <div class="mainContent">
      <div class="banner" src="./components/images/chalcidBanner.jpg" alt="Banner Image"></div>
      <div id="app">
        <LinkRow></LinkRow>
        <router-view :key="$route.fullPath"></router-view>
      </div>
    </div>
    <div class="footer"><span>Powered by: <a href="http://taxonworks.org/"><img src="/taxonworksImage.svg" /></a></span></div>
  </div>
</template>

<style scoped>
.wholeHeight {
  display: flex;
  flex-direction: column;
  min-height: 95vh;
}

.mainContent {
  flex: 1 0 auto;
}

header {
  line-height: 1.5;
}

.footer {
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  align-items: center;
  align-self: center;
  width: 100%;
  height: 50px;
}

.footer img {
  height: 50px;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
    
  .banner {
    width: 100%;
    height: 200px;
    overflow: hidden;
    background-image: url('./components/images/chalcidBanner.jpg');
    background-repeat: repeat-x;
    background-position: left;
  }
}
</style>