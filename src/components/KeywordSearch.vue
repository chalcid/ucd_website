<template>
  <div>
    <label for="topic-select" style="margin-right: 5px;">Select Topic:</label>
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
      <references :kwProp="refs" :tn-Prop="tnProp" class="space-below"/>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch, computed, unref } from 'vue'
  import References from './References.vue'
  import api from '/api.js'
  
  const selectedTopicId = ref('');
  const citations = ref([]);
  const notes = ref([]);
  const loadingSources = ref(false);
  const apiResults = ref([]);
  const sortedResponse = ref([]);
  const arrayInJson = ref([]);
  const jsonToDownload = ref(null);
  const citationsOutput = ref([]);
  const notesOutput = ref([]);
  const kwProp = ref([]);
  const refs = ref([]);
  
  const props = defineProps({
    ksProp: String,
    otuProp: String
  });

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

  async function fetchSources() {
    loadingSources.value = true
    try {
      const response = await api.get(`/citations`,
       {params: {
          otu_id: props.ksProp,
          citations_on_otus: "true",
          per: "5000",
          extend: ['topic','citation_topics','source','bibtex'],
          project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
        }})
      citations.value = response.data;
      citations.value = citations.value.filter(x => x.citation_topics?.some(ct => ct.topic?.id === selectedTopicId.value));
    } catch (error) {
      console.error('Failed to fetch citations:', error)
      citations.value = []
    } finally {
      //console.log("citations after fetch: " + citations.value);
      loadingSources.value = false;
      fetchNotes();
      return(citationsOutput);
    }
  };
  
  async function fetchNotes() {
    const citationIDs = citations.value.map(c => `${c.id}`);
    //console.log("citationIDs: " + citationIDs)
    //console.log("citations output: " + citationsOutput)
    try {
      const notesResponse = await api.get(`/notes`,
        {params: {
          note_object_type: "Citation",
          'note_object_id[]': citationIDs,
          project_token: import.meta.env.VITE_APP_PROJECT_TOKEN
      }});
      
      const noteRows = Array.isArray(notesResponse.data) ? notesResponse.data : Object.values(notesResponse.data);
      const bucket = {};
      
      for (const n of noteRows) {
        const id = String(n.note_object_id);
        (bucket[id] ??= []).push(n.text);
        //console.log("note pushed: " + n.text)
      }
      
      Object.keys(bucket).forEach(id => {
        bucket[id] = bucket[id].sort().join(' ')
      })
      
      notes.value = bucket;
      
      //console.log('notes map ->', notes.value);
    } catch(error) {
      console.error('Failed to fetch notes:', error)
      notes.value = {}
    } finally {
      //console.log("notes after notes call: ", Object.values(notes.value).join(' | '), "count: ", Object.keys(notes.value).length)
      //console.log("citations after notes call: ", Object.values(citations.value));
      refs.value = refs.value = kwReferences({ citations, notes });
    }
  };
  
  const sortResponse = () => {
    sortedResponse.value = apiResults.value.sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })
  };
  
  function kwReferences() {
    //console.log("notes passed to kwReferences: " + Object.values(notes).join(' | '));
    const unrefCitations = unref(citations) || [];
    const unrefNotes = unref(notes) || {};
    //console.log("unrefCitations: ", unrefCitations);
    const refs = unrefCitations.map (c => {
      let refStr = `${c.source.object_tag}. Page(s): ${c.pages ?? ''}`
      let extra = unrefNotes[c.id]
      if (extra) {
        if (Array.isArray(extra)) extra = extra.join(' ')
        refStr += `. Note: ${extra}`
      }
      return refStr;
    });
    //jsonToDownload["Topic references"] = merged;
    //kwJson.value = merged.sort();
    //console.log("refs from kwReferences after notes are attached: ", refs);
    return refs;
  };
  
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(jsonToDownload.value)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'biologicalAssociations.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }
  
  const downloadTSV = (key) => {
    var arrayInJson = jsonToDownload.value[key];
    if (arrayInJson) {
      var tsv = jsonToTsv(arrayInJson, keysToExtract);
      if (tsv) {
        var filename = `${props.tnProp}_${key}.tsv`;
        var blob = new Blob([tsv], {type: 'text/tab-separated-values' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      else {
        console.log(`Expected array but got ${typeof tsv}`)
      }
    }
    else {
      console.log(`Expected array but got ${typeof arrayInJson}`)
    }
  };

  watch(selectedTopicId, id => {
    if (id) {
      fetchSources(id);
    }
    else {
      citations.value = [];
    }
  });
  
</script>