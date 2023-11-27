require('dotenv').config();
const defaultWDS = "~/Documents/projects,~/Documents".split(',');
const WDS = process.env.wds.split(',') || defaultWDS;
const fs = require('fs').promises;
const path = require('path');

function searchFolders(directoryPath, searchTerm) {
  return fs.readdir(directoryPath)
    .then(items => {
      return Promise.all(items.map(item => {
        const itemPath = path.join(directoryPath, item);
        return fs.stat(itemPath)
          .then(stats => ({ item, stats }))
          .catch(error => {
            // Handle ENOENT and ENXIO errors and continue
            if (error.code === 'ENOENT') {
              //console.error(`Warning: ${itemPath} not found.`);
              return null; // Return null to filter out the item
            } else if (error.code === 'ENXIO') {
              //console.error(`Warning: ${itemPath} - no such device or address.`);
              return null; // Return null to filter out the item
            } else {
              throw error; // Propagate other errors
            }
          });
      }))
        .then(results => results.filter(result => result !== null && result.stats.isDirectory()))
        .then(folders => {
          // Filter folders based on whether they contain the searchTerm
          const filteredFolders = folders.filter(folder => folder.item.includes(searchTerm));

          const folderDetails = filteredFolders.map(folder => ({
            title: folder.item,
            fullPath: path.join(directoryPath, folder.item)
          }));
          return folderDetails;
        });
    });
}

// Ensure that process.argv[2] is defined before using it as the searchTerm
const searchTerm = process.argv[2] || '';

Promise.all(WDS.map(directoryPath => searchFolders(directoryPath, searchTerm)))
  .then(allFolders => {
    const flatFolders = [].concat(...allFolders);

    console.log(JSON.stringify({
      "items": flatFolders.map(folder => ({
        title: folder.title,
        subtitle: `Open folder ...`,
        valid: true,
        arg: `${folder.fullPath}`,
        icon: { path: "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertCautionIcon.icns" }
      }))
    }));
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
