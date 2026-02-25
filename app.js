require('dotenv').config();
const defaultWDS = "~/Documents/projects,~/Documents".split(',');
const WDS = process.env.wds.split(',') || defaultWDS;
const WORKSPACE_DIRS = process.env.workspace_dirs ? process.env.workspace_dirs.split(',') : [];
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

function searchWorkspaces(directoryPath, searchTerm) {
  return fs.readdir(directoryPath)
    .then(items => {
      const workspaceFiles = items.filter(item => item.endsWith('.code-workspace'));
      const filtered = workspaceFiles.filter(file => {
        const name = file.replace('.code-workspace', '');
        return name.includes(searchTerm);
      });
      return filtered.map(file => ({
        title: file.replace('.code-workspace', ''),
        fullPath: path.join(directoryPath, file)
      }));
    })
    .catch(error => {
      if (error.code === 'ENOENT' || error.code === 'ENXIO') {
        return [];
      }
      throw error;
    });
}

// Ensure that process.argv[2] is defined before using it as the searchTerm
const searchTerm = process.argv[2] || '';

const folderSearches = WDS.map(directoryPath => searchFolders(directoryPath, searchTerm));
const workspaceSearches = WORKSPACE_DIRS.map(directoryPath => searchWorkspaces(directoryPath, searchTerm));

Promise.all([...folderSearches, ...workspaceSearches])
  .then(allResults => {
    const flatFolders = [].concat(...allResults.slice(0, folderSearches.length));
    const flatWorkspaces = [].concat(...allResults.slice(folderSearches.length));

    const folderItems = flatFolders.map(folder => ({
      title: folder.title,
      subtitle: `Open folder ...`,
      valid: true,
      arg: `${folder.fullPath}`,
      icon: { path: "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertCautionIcon.icns" }
    }));

    const workspaceItems = flatWorkspaces.map(ws => ({
      title: ws.title,
      subtitle: `Open workspace ...`,
      valid: true,
      arg: `${ws.fullPath}`,
      icon: { path: "/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/SidebarDocumentsFolder.icns" }
    }));

    console.log(JSON.stringify({ "items": [...workspaceItems, ...folderItems] }));
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
