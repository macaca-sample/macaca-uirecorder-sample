var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var faker  = require('faker');
var chai = require("chai");
var should = chai.should();
var JWebDriver = require('jwebdriver');
chai.use(JWebDriver.chaiSupportChainPromise);

var rootPath = getRootPath();
var appPath = 'app\\test.apk';
var platformName = /\.apk$/.test(appPath)?'Android':'iOS';

module.exports = function(){

    var driver, testVars;

    before(function(){
        var self = this;
        driver = self.driver;
        testVars = self.testVars;
    });

    it('click: please input usernam... ( //*[@resource-id="com.github.android_app_bootstrap:id/mobileNoEditText"] )', function(){
        return driver.wait('//*[@resource-id="com.github.android_app_bootstrap:id/mobileNoEditText"]', 30000).click();
    });
    
    it('val: 111', function(){
        return driver.val('111');
    });
    
    it('click: please input passwor... ( //*[@resource-id="com.github.android_app_bootstrap:id/codeEditText"] )', function(){
        return driver.wait('//*[@resource-id="com.github.android_app_bootstrap:id/codeEditText"]', 30000).click();
    });
    
    it('val: 222', function(){
        return driver.val('222');
    });
    
    it('click: Login ( //*[@resource-id="com.github.android_app_bootstrap:id/login_button"] )', function(){
        return driver.wait('//*[@resource-id="com.github.android_app_bootstrap:id/login_button"]', 30000).click();
    });
    
    it('click: //*[@resource-id="android:id/tabs"]/android.widget.LinearLayout[2]/android.widget.ImageView', function(){
        return driver.wait('//*[@resource-id="android:id/tabs"]/android.widget.LinearLayout[2]/android.widget.ImageView', 30000).click();
    });
    
    it('click: //*[@resource-id="com.github.android_app_bootstrap:id/swipe_container"]/android.webkit.WebView/android.webkit.WebView/android.widget.ListView/android.view.View[5]/android.widget.Button', function(){
        return driver.wait('//*[@resource-id="com.github.android_app_bootstrap:id/swipe_container"]/android.webkit.WebView/android.webkit.WebView/android.widget.ListView/android.view.View[5]/android.widget.Button', 30000).click();
    });
    
    it('click: //*[@resource-id="android:id/tabs"]/android.widget.LinearLayout/android.widget.ImageView', function(){
        return driver.wait('//*[@resource-id="android:id/tabs"]/android.widget.LinearLayout/android.widget.ImageView', 30000).click();
    });
    
    it('click: list ( //*[@resource-id="com.github.android_app_bootstrap:id/list_button"] )', function(){
        return driver.wait('//*[@resource-id="com.github.android_app_bootstrap:id/list_button"]', 30000).click();
    });
    
    it('swipe: 456, 998, 449, 708, 20', function(){
        return driver.touchSwipe(456, 998, 449, 708, 20);
    });
    
    it('click: Test test test ( //*[@resource-id="com.github.android_app_bootstrap:id/listview"]/android.widget.TextView[7] )', function(){
        return driver.wait('//*[@resource-id="com.github.android_app_bootstrap:id/listview"]/android.widget.TextView[7]', 30000).click();
    });
    
    it('swipe: 366, 764, 352, 1178, 20', function(){
        return driver.touchSwipe(366, 764, 352, 1178, 20);
    });
    
    it('click: Toast ( //*[@text="Toast"] )', function(){
        return driver.wait('//*[@text="Toast"]', 30000).click();
    });
    
    it('click: Toast ( //*[@resource-id="com.github.android_app_bootstrap:id/toast_button"] )', function(){
        return driver.wait('//*[@resource-id="com.github.android_app_bootstrap:id/toast_button"]', 30000).click();
    });
    
    function _(str){
        return typeof str === 'string' && str.replace(/\{\{(.+?)\}\}/g, function(all, key){
            return testVars[key] || '';
        }) || str;
    }

};

if(module.parent && /mocha\.js/.test(module.parent.id)){
    runThisSpec();
}

function runThisSpec(){
    // read config
    var runtime = process.env['runtime'] || '';
    var config = require(rootPath + '/config'+(runtime?'-'+runtime:'')+'.json');
    var webdriverConfig = Object.assign({},config.webdriver);
    var host = webdriverConfig.host;
    var port = webdriverConfig.port || 4444;
    var testVars = config.vars;

    var screenshotPath = rootPath + '/screenshots';
    var doScreenshot = fs.existsSync(screenshotPath);

    var specName = path.relative(rootPath, __filename).replace(/\\/g,'/').replace(/\.js$/,'');

    var arrDeviceList = getEnvList() || getDeviceList(platformName);
    if(arrDeviceList.length ===0 ){
        console.log('Search mobile device failed!');
        process.exit(1);
    }

    arrDeviceList.forEach(function(device){
        var caseName = specName + ' : ' + (device.name?device.name+' ['+device.udid+']':device.udid);

        if(doScreenshot){
            mkdirs(path.dirname(screenshotPath + '/' + caseName));
        }

        describe(caseName, function(){

            var stepId = 1;

            this.timeout(600000);
            this.slow(1000);

            before(function(){
                var self = this;
                var driver = new JWebDriver({
                    'host': host,
                    'port': port
                });
                self.driver = driver.session({
                    'platformName': platformName,
                    'udid': device.udid,
                    'app': /^(\/|[a-z]:\\)/i.test(appPath) ? appPath : rootPath + '/' + appPath
                });
                self.testVars = testVars;
                return self.driver;
            });

            module.exports();

            afterEach(function(){
                if(doScreenshot){
                    var filepath = screenshotPath + '/' + caseName.replace(/[^\/]+$/, function(all){
                        return all.replace(/\s*[:\.\:\-\s]\s*/g, '_');
                    }) + '_' + (stepId++) + '.png';
                    return this.driver.getScreenshot(filepath).catch(function(){});
                }
            });

            after(function(){
                return this.driver.close();
            });

        });
    });
}

function getRootPath(){
    var rootPath = path.resolve(__dirname);
    while(rootPath){
        if(fs.existsSync(rootPath + '/config.json')){
            break;
        }
        rootPath = rootPath.substring(0, rootPath.lastIndexOf(path.sep));
    }
    return rootPath;
}

function mkdirs(dirname){
    if(fs.existsSync(dirname)){
        return true;
    }else{
        if(mkdirs(path.dirname(dirname))){
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

function callSpec(name){
    try{
        require(rootPath + '/' + name)();
    }
    catch(e){
        console.log(e)
        process.exit(1);
    }
}

function getEnvList(){
    var strEnvList = process.env.devices;
    if(strEnvList){
        return strEnvList.split(/\s*,\s*/).map(function(udid){
            return {udid: udid};
        });
    }
}

function getDeviceList(platformName){
    var arrDeviceList = [];
    var strText, match;
    if(platformName === 'Android')
    {
        // for android
        strText = cp.execSync('adb devices').toString();
        strText.replace(/(.+?)\s+device\r?\n/g, function(all, deviceName){
            arrDeviceList.push({
                udid: deviceName
            });
        });
    }
    else{
        // ios real device
        strText = cp.execSync('instruments -s devices').toString();
        strText.replace(/([^\r\n]+)\s+\[(.+?)\]\r?\n/g, function(all, deviceName, udid){
            if(/^(iphone|ipad)/i.test(deviceName)){
                arrDeviceList.push({
                    name: deviceName,
                    udid: udid
                });
            }
        });
        // ios simulator
        strText = cp.execSync('xcrun simctl list devices').toString();
        strText.replace(/\r?\n\s*(.+?)\s+\((.+?)\) \(Booted\)/g, function(all, deviceName, udid){
            arrDeviceList.push({
                name: deviceName,
                udid: udid
            });
        });
    }
    return arrDeviceList;
}

