const fs = require('fs');
var path = require('path');

module.exports = function(app, rootFolder) {
    app.get('/assets/dark-cards', (req, res) => {
        var dirName = '/resources/cards/dark';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/helper-cards', (req, res) => {
        var dirName = '/resources/cards/helper';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/mystery-cards', (req, res) => {
        var dirName = '/resources/cards/mystery';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/player-cards', (req, res) => {
        var dirName = '/resources/cards/player';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/dark-mark', (req, res) => {
        var dirName = '/resources/map/dark_mark';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/map-dark-card', (req, res) => {
        var dirName = '/resources/map/dark_card';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/dice', (req, res) => {
        var dirName = '/resources/map/dice';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/door', (req, res) => {
        var dirName = '/resources/map/door';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/footprint', (req, res) => {
        var dirName = '/resources/map/footprint';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/gateway', (req, res) => {
        var dirName = '/resources/map/gateway';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/note', (req, res) => {
        var dirName = '/resources/map/note';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/other-map', (req, res) => {
        var dirName = '/resources/map/other';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/selection', (req, res) => {
        var dirName = '/resources/map/selection';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/tile', (req, res) => {
        var dirName = '/resources/map/tile';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/other-menu', (req, res) => {
        var dirName = '/resources/menu/other';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/tutorial', (req, res) => {
        var dirName = '/resources/menu/tutorial';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/tokens/mystery-room', (req, res) => {
        var dirName = '/resources/tokens/mystery/room';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/tokens/mystery-tool', (req, res) => {
        var dirName = '/resources/tokens/mystery/tool';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/tokens/mystery-suspect', (req, res) => {
        var dirName = '/resources/tokens/mystery/suspect';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/assets/tokens/player', (req, res) => {
        var dirName = '/resources/tokens/player';
        var jsonString = "[\n";
        fs.readdirSync(path.join(rootFolder, dirName)).forEach(file => {
            jsonString += "    {\n        \"path\": \"";
            jsonString += dirName.substr(1, dirName.length) + "/" + file;
            jsonString += "\"\n    },\n"
        });
        jsonString = jsonString.substr(0, jsonString.length - 2);
        jsonString += "\n]"
        var json = 
        {
            file_names: JSON.parse(jsonString)
        };
        res.status(200).json(json);
    });

    app.get('/asset-count', (req, res) => {
        var dirPath = path.join(rootFolder, '/resources');
        var arrayOfFiles = getAllDirFiles(dirPath, []);
        res.status(200).json({ count: arrayOfFiles.length });
    });
}

var getAllDirFiles = function(dirPath, arrayOfFiles) {
    var files = fs.readdirSync(dirPath);
        var arrayOfFiles = arrayOfFiles || [];
        files.forEach(function(file) {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getAllDirFiles(dirPath + "/" + file, arrayOfFiles)
            }
            else {
                arrayOfFiles.push(file);
            }
        });
    return arrayOfFiles;
}