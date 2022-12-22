(function($){
    
    var primarySatellite = "primary";    
    
    const configUrl='/config.json';
    var GOES_SERVICE_ADDRESS;
    
    // set up colors for plot, both light and dark modes
    var colors = {
        'series0': {'light': "#001dff", 'dark':"#00ffee"},
        'series1': {'light': "#ff0000", 'dark':"#ff0000"},
        'series2': {'light': "#5400a8", 'dark': "#faff00"},
        'series3': {'light': "#ffa500", 'dark': "#00ff66"},
        'background': {'light': "white", 'dark': "black"},
        'contrast': {'light': "black", 'dark': "white"},
        'title': {'light': "#333333", 'dark': "#ffffff"},
        'minor': {'light': "#666666", 'dark': "#ffffff"},
        'deactivated': {'light': "#cccccc", 'dark': "#5b5b5b"},
    }
    
    var isDrupal = false;
    var light_or_dark = "dark";    
    var flareTableConfig;        
    
    $(document).ready(function() {
        if($('#flare_table')[0]){
          populateFlareTable();
        }            
    });

    function populateFlareTable() {
      var data_service_url = $('#dataservice_url')[0];

        if (data_service_url)
        {          
          isDrupal = true;
          //get the data service URL from the div (in the noaa scales block)
          data_service_url = $(data_service_url).text();
          light_or_dark = "light";
          
          flareTableConfig = $('#flare_table').data("table-config");
          if ('dataURL' in flareTableConfig)
          {            
            GOES_SERVICE_ADDRESS = data_service_url + '/' + flareTableConfig.dataURL;           
          }
          if ('color-mode' in flareTableConfig)
          {
            light_or_dark = flareTableConfig['color-mode'];
          }
          getSatelliteFlareTableData();          
        }
        else
        {
       
          // Get the address of the server to get GOES data from, then request data        
          $.getJSON(configUrl, function(data){
              GOES_SERVICE_ADDRESS = data.GOES_SERVICE_ADDRESS;
              setPrimarySecondaryFromQueryString();
              getSatelliteFlareTableData();
          });
          
          setLightOrDarkFromQueryString();
          $('body').css({
                  "background-color": colors['background'][light_or_dark],
                  "color": colors['contrast'][light_or_dark] 
              });
        }
    }

    function setPrimarySecondaryFromQueryString() {
        var primary   = getUrlParameter('primary');
        var secondary = getUrlParameter('secondary');
        if(primary){ primarySatellite = primary; }
        if(secondary) { secondarySatellite = secondary; }
        if(secondary == 'none') { secondarySatellite = ''; }
    }

    function setLightOrDarkFromQueryString(){
        var lightOrDark = getUrlParameter('color');
        if(lightOrDark == "dark" || lightOrDark == "light"){
            light_or_dark = lightOrDark;
        }
    }      

    function getSatelliteFlareTableData(){
        var goesFlareServiceUrl = GOES_SERVICE_ADDRESS + "/xray_flares?satellite=" + primarySatellite;
        if(isDrupal){
          goesFlareServiceUrl = GOES_SERVICE_ADDRESS;
        }
        $.getJSON(goesFlareServiceUrl, function(data){
            
            if(typeof data[0] === 'undefined'){
                data = [];
            }else{
                data = data[0];
            }

            $('#flare-satellite').text(flareTableFormatField(data,'satellite'));
            $('#flare-current > .flare-time').text(flareTableFormatField(data,'time_tag'));
            $('#flare-current > .flare-class').text(flareTableFormatField(data,'current_class'));
            $('#current-ratio').text(flareTableFormatField(data,'current_ratio'));            
            $('#flare-begin > .flare-time').text(flareTableFormatField(data,'begin_time'));
            $('#flare-begin > .flare-class').text(flareTableFormatField(data,'begin_class'));
            $('#flare-max > .flare-time').text(flareTableFormatField(data,'max_time'));
            $('#flare-max > .flare-class').text(flareTableFormatField(data,'max_class'));           
            $('#integrated-flux').text(flareTableFormatField(data,'current_int_xrlong'));            
            $('#flare-end > .flare-time').text(flareTableFormatField(data,'end_time'));
            $('#flare-end > .flare-class').text(flareTableFormatField(data,'end_class'));
            
        });
    }

    function flareTableFormatField(data, field) {
        if(typeof data[field] == 'undefined' || data[field] == "Unk" || data[field] === null){
            return "****";
        }else{
            if(field == 'current_ratio'){
                return data[field].toFixed(3);
            }
            if(field == 'current_int_xrlong'){
                return data[field].toExponential(1);
            }
            if(field.includes('time')){
              var date = new Date(data[field]);
              if(isDrupal){
                return date.toUTCString().slice(4);
              }
              else{                
                var dateString = (date.getUTCDate()    < 10 ? '0' : '') + date.getUTCDate() + "/"
                dateString    += (date.getUTCHours()   < 10 ? '0' : '') + date.getUTCHours();
                dateString    += (date.getUTCMinutes() < 10 ? '0' : '') + date.getUTCMinutes();                
                return dateString;
              }
            }  
            return data[field];
        }
    }
    
    
    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };
        
}(jQuery));
