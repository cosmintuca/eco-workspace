require("../../../psknode/bundles/pskruntime");
var fs = require("fs");
const assert = require("privatesky/modules/deployer/test/double-check").assert;
const fsExt = require('../../../libraries/utils/FSExtension').fsExt;
var fsm = require("../../../libraries/utils/FileStateManager.js");
var fileStateManager = fsm.getFileStateManager();

var deployer  = require( __dirname + "/../../../test/Deployer.js");

const path = require("path");
const os = require("os");
var testWorkspaceDir = path.join(os.tmpdir(), fsExt.guid());
var dummySrcDir = path.join(testWorkspaceDir, "./move-source");
var dummyTargetDirBase = path.join(testWorkspaceDir, "./move-destination");
var dummyTargetDir = `${dummyTargetDirBase}/dummy-dependency`;
var dependencyName = "dummy-dependency";

var f = $$.flow.describe("moveCheckSourceAfterActionTest", {
    start:function(end) {
        this.end = end;
        this.beforeExecution();
        this.act();
    },

    beforeExecution:function() {
        this.configObject = {
            "dependencies": [
                {
                    "name": dependencyName,
                    "src": "npm",
                    "actions": [{
                        "type": "move",
                        "src": `${dummySrcDir}/dummy-dependency`,
                        "target": dummyTargetDir
                    }]
                }
            ]
        };
        fileStateManager.saveState([testWorkspaceDir]);
        fsExt.createDir(`${dummySrcDir}/dummy-dependency/sub-dir`);
        fsExt.createFile(`${dummySrcDir}/dummy-dependency/file1.js`, "alert('test1')!");
    },

    act:function() {
        deployer.run(this.configObject, this.callback);
    },

    clean:function(){
        console.log("restoring");
        fileStateManager.restoreState();
    },

    callback:function (error, result) {
        // TODO here maybe we can check all source files to match the ones from the destination files
        assert.notNull(result, "Result should not be null!");
        assert.isNull(error, "Should not be any errors!");
        let targetPath = fsExt.resolvePath(`${dummySrcDir}/dummy-dependency`);
        assert.true(!fs.existsSync(targetPath), `[FAIL] Dependency "${dependencyName}" exist in ${targetPath}`);
        this.end();

    }
})();
assert.callback("moveCheckSourceAfterActionTest", function(end) {
    setTimeout(function(){
        console.log("Forcing clean");
        f.clean();
    }, 1500);
    f.start(end);
});

