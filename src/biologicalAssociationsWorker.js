self.addEventListener('message', event => {
  const workerData = event.data;
  console.log("event.data", event.data)
  
  const plainBaJSON = workerData.plainBaJSON;
  const familyName = workerData.familyName;
  
  console.log("familyName", familyName)
  
  let groupedBiologicalAssociations = [];
  
  const sortedBiologicalAssociations = plainBaJSON
    .filter(association => association.biological_relationship.name !== "compared with")
    .filter(association => association.object.object_tag)
    .map(association => {
      const citation = association.citations?.length? association.citations
        .map(citation => citation.citation_source_body)
        .sort()
        .join("; ")
        : 'No citation';
      const objectTag = association.object.object_tag.replace(" &#10003;", "").replace(" &#10060;", "").replace(" [c]", "");
      const relationship = association.biological_relationship.object_label.toLowerCase();
      const object = association.object.object_label;
      const subject = association.subject.object_tag.replace(" &#10003;", "").replace(" &#10060;", "").replace(" [c]", "");
      const groupingFamily = 
        association.object.family_name !== familyName ? association.object.family_name :
        association.subject.family_name !== familyName ? association.subject.family_name :
        familyName;
      
      console.log("sortedIsFinishing")
        
      return {
        associationText: `${objectTag} is a ${relationship} of ${subject}, (${citation})`.replace("a associate", "an associate"),
        groupingFamily: groupingFamily,
        objectName: object
      }
    });
      
  groupedBiologicalAssociations = sortedBiologicalAssociations.reduce((group, association) => {
    console.log("groupedStarted")
    const groupingFamily = association.groupingFamily;
    if (!group.some(item => item[0] === groupingFamily)) {
      group.push([groupingFamily, []]);
    }
    group.find(item => item[0] === groupingFamily)[1].push(association);
    
    for (let i = 0; i < group.length; i++) {
      group[i][1].sort((a, b) => {
        return a.objectName.localeCompare(b.objectName);
      });
    }
    return group;
  }, []);
  
  groupedBiologicalAssociations.forEach(([family, associations]) => {
    associations.sort((a, b) => {
      return a.objectName.localeCompare(b.objectName);
    });
  });
    
  groupedBiologicalAssociations.sort(([familyA,], [familyB,]) => {
    if (!familyA && !familyB) return 0;
    if (!familyA) return 1;
    if (!familyB) return -1;
    return familyA.localeCompare(familyB);
  });
    
  console.log("groupedBiologicalAssociations", groupedBiologicalAssociations)

  self.postMessage(groupedBiologicalAssociations);
});