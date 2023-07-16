<template>
  <div v-if="imData && imData[0]" style="text-align: center;">
    <div>Image {{ currentImageIndex + 1 }} of {{ imData.length }}</div>
    <div style="display: flex; justify-content: center; align-items: center;">
      <font-awesome-icon v-if="imData.length > 1" class="carouselArrow" icon="angle-left" @click="previousImage"/>
      <a :href="imData[currentImageIndex].original" target="_blank"><img :src="imData[currentImageIndex].medium" alt="Image description"></a>
      <font-awesome-icon v-if="imData.length > 1" class="carouselArrow" icon="angle-right" @click="nextImage"/>
    </div>
  </div>
</template>    

<script>
  import { ref, onMounted } from 'vue'
  import api from '/api.js'

  export default {
    name: 'Images',
    
    props: {
      baProp: Array
    },
    
    setup(props) {
      const imData = ref([]);
      const currentImageIndex = ref(0);
      
      onMounted(async () => {
        try {
          if(props.baProp && props.baProp.length > 0){
            const imResponse = await api.get(`/images`,
            {params: {
              taxon_name_id: props.baProp,
              per: "10000",
              project_token: import.meta.env.VITE_APP_PROJECT_TOKEN,
            }});
            imData.value = await imResponse.data;
            console.log("imData[0] is: " + imData.value);
          }
        } catch (error) {
          console.log("There was a problem retrieving images.")
      }});
      
      const nextImage = () => {
        if (imData && imData[0]) {
          currentImageIndex.value = (currentImageIndex.value + 1) % imData.value.length;
        };
      };

      const previousImage = () => {
        if (imData && imData[0]) {
          currentImageIndex.value = (currentImageIndex.value + imData.value.length - 1) % imData.value.length;
        };
      };
        
      return {
        imData,
        nextImage,
        previousImage,
        currentImageIndex
      };
    }
  }
</script>