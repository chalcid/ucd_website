<template>
  <div>
    <label for="topic-select">Select Topic: </label>
    <select id="topic-select" v-model="selectedTopicId">
      <option disabled value="">-- choose a topic --</option>
      <option
        v-for="term in sortedResponse"
        :key="term.id"
        :value="term.id"
      >
        {{ term.name }}
      </option>
    </select>

    <div v-if="loadingSources">Loading sources...</div>
    <div v-else>
      <searchResults v-if="sources.length" :items="sources" :soProp="sources" class="space-below"/>
      <p v-else>No sources found for the selected topic.</p>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import SearchResults from './SearchResults.vue'
  import api from '/api.js'
  
  const selectedTopicId = ref('');
  const sources = ref([]);
  const loadingSources = ref(false);
  const apiResults = ref([]);
  const sortedResponse = ref([]);
  
  onMounted(async () => {
    fetchTopics();
  });

  async function fetchTopics() {
    try {
      const response = await api.get(`/controlled_vocabulary_terms`,
        {params: {
          type: "Topic",
          per: "5000",
          project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
        }})
      apiResults.value = response.data
      sortResponse();
    } catch (error) {
      console.error('Failed to fetch topics:', error)
    }
  }

  async function fetchSources(topicId) {
    loadingSources.value = true
    try {
      const response = await api.get(`/sources`,
      {params: {
          topic_id: [topicId],
          per: "5000",
          extend: ['bibtex'],
          project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
        }})
      sources.value = response.data
    } catch (error) {
      console.error('Failed to fetch sources:', error)
      sources.value = []
    } finally {
      loadingSources.value = false
    }
  }

  const sortResponse = () => {
    sortedResponse.value = apiResults.value.sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })
  };
  
  watch(selectedTopicId, id => {
    if (id) {
      fetchSources(id);
    }
    else {
      sources.value = [];
    }
  });
</script>