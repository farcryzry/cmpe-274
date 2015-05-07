/*
 * Author: Abdullah A Almsaeed
 * Date: 4 Jan 2014
 * Description:
 *      This is a demo file used only for the main dashboard (index.html)
 **/
"use strict";

$(function () {

    $.get('api/areas', function(result) {
        //console.log(result);

        $('#stat-area').text(result.length);

        result.forEach(function(area){
            var option = '<option value="'+ area.Area +'">' + area.Area + '</option>';
            $('#areas').append(option);
            $('#area1').append(option);
            $('#area2').append(option);
        });
    });

    $.get('api/diseases', function(result) {
        //console.log(result);

        $('#stat-disease').text(result.length);

        result.forEach(function(disease){
            var option = '<option value="'+ disease +'">' + disease + '</option>';
            $('#diseases').append(option);
            $('#disease').append(option);
        });
    });

    $.get('api/groups', function(result) {
        //console.log(result);
        result.forEach(function(item){
            var option = '<option value="'+ item.name +'">' + item.name + '</option>';
            $('#disease_groups').append(option);
        });
    });


    //Activate the iCheck Plugin
    $('input[type="checkbox"]').iCheck({
        checkboxClass: 'icheckbox_flat-blue',
        radioClass: 'iradio_flat-blue'
    });
    //Make the dashboard widgets sortable Using jquery UI
    $(".connectedSortable").sortable({
        placeholder: "sort-highlight",
        connectWith: ".connectedSortable",
        handle: ".box-header, .nav-tabs",
        forcePlaceholderSize: true,
        zIndex: 999999
    });
    $(".connectedSortable .box-header, .connectedSortable .nav-tabs-custom").css("cursor", "move");
    //jQuery UI sortable for the todo list
    $(".todo-list").sortable({
        placeholder: "sort-highlight",
        handle: ".handle",
        forcePlaceholderSize: true,
        zIndex: 999999
    });

    //bootstrap WYSIHTML5 - text editor
    $(".textarea").wysihtml5();

    $('.daterange').daterangepicker(
        {
            ranges: {
                'This Year': [moment().startOf('year'), moment().endOf('year')],
                'Last Year(2014)': [moment('20140101', 'YYYYMMDD'), moment('20140101', 'YYYYMMDD').endOf('year')]
            },
            startDate: moment('20140101', 'YYYYMMDD'),
            endDate: moment()
        },
        function (start, end) {
            alert("You chose: " + start.format('MMMM D, YYYY - WW ') + ' - ' + end.format('MMMM D, YYYY - WW'));
        });

    /* jQueryKnob */
    $(".knob").knob();

    //jvectormap data
    var visitorsData = {
        "US": 398, //USA
        "SA": 400, //Saudi Arabia
        "CA": 1000, //Canada
        "DE": 500, //Germany
        "FR": 760, //France
        "CN": 300, //China
        "AU": 700, //Australia
        "BR": 600, //Brazil
        "IN": 800, //India
        "GB": 320, //Great Britain
        "RU": 3000 //Russia
    };


    //Sparkline charts
    var myvalues = [1000, 1200, 920, 927, 931, 1027, 819, 930, 1021];
    $('#sparkline-1').sparkline(myvalues, {
        type: 'line',
        lineColor: '#92c1dc',
        fillColor: "#ebf4f9",
        height: '50',
        width: '80'
    });
    myvalues = [515, 519, 520, 522, 652, 810, 370, 627, 319, 630, 921];
    $('#sparkline-2').sparkline(myvalues, {
        type: 'line',
        lineColor: '#92c1dc',
        fillColor: "#ebf4f9",
        height: '50',
        width: '80'
    });
    myvalues = [15, 19, 20, 22, 33, 27, 31, 27, 19, 30, 21];
    $('#sparkline-3').sparkline(myvalues, {
        type: 'line',
        lineColor: '#92c1dc',
        fillColor: "#ebf4f9",
        height: '50',
        width: '80'
    });

    //The Calender
    $("#calendar").datepicker();

    //SLIMSCROLL FOR CHAT WIDGET
    $('#chat-box').slimScroll({
        height: '250px'
    });

    $.get('api/count/area/CALIFORNIA', function(result) {
        var data = {};
        var diseases = [];
        var final = [];

        result.Data.forEach(function(item){
            if(diseases.indexOf(item.Disease) < 0) diseases.push(item.Disease);
            var key = item.Year + ' W' + item.Week;
            if(!data[key]) {
                data[key] = {};
            }
            data[key][item.Disease] = item.Count;
        });

        diseases = _.shuffle(diseases).slice(0, 5);

        Object.getOwnPropertyNames(data).forEach(function(week){
            var item = {y: week};
            diseases.forEach(function(disease){
                item[disease] = data[week][disease] || 0;
            });
            final.push(item);
        });

        console.log(final);

        var line = new Morris.Line({
            element: 'multi-disease-chart',
            resize: true,
            data: final,
            xkey: 'y',
            ykeys: diseases,
            labels: diseases,
            lineWidth: 2,
            hideHover: 'auto',
            gridTextColor: "#fff",
            gridStrokeWidth: 0.4,
            pointSize: 4,
            pointStrokeColors: ["#efefef"],
            gridLineColor: "#efefef",
            gridTextFamily: "Open Sans",
            gridTextSize: 10
        });
    });


    //Fix for charts under tabs
    $('.box ul.nav a').on('shown.bs.tab', function (e) {
        donut.redraw();
    });


    /* BOX REFRESH PLUGIN EXAMPLE (usage with morris charts) */
    //$("#loading-example").boxRefresh({
    //    source: "ajax/dashboard-boxrefresh-demo.php",
    //    onLoadDone: function (box) {
    //        var bar = new Morris.Bar({
    //            element: 'bar-chart',
    //            resize: true,
    //            data: [
    //                {y: '2006', a: 100, b: 90},
    //                {y: '2007', a: 75, b: 65},
    //                {y: '2008', a: 50, b: 40},
    //                {y: '2009', a: 75, b: 65},
    //                {y: '2010', a: 50, b: 40},
    //                {y: '2011', a: 75, b: 65},
    //                {y: '2012', a: 100, b: 90}
    //            ],
    //            barColors: ['#00a65a', '#f56954'],
    //            xkey: 'y',
    //            ykeys: ['a', 'b'],
    //            labels: ['CPU', 'DISK'],
    //            hideHover: 'auto'
    //        });
    //    }
    //});

    /* The todo list plugin */
    $(".todo-list").todolist({
        onCheck: function (ele) {
            console.log("The element has been checked")
        },
        onUncheck: function (ele) {
            console.log("The element has been unchecked")
        }
    });

    $("#btn-ask-watson").click(function(){
        var question = $("#input-question").val();
        var time = moment().format('h:mm');
        if(question) {
            var item = $('<div class="item"> <img src="images/avengers-avatar.png" alt="user image" class="online"/>'
            + '<p class="message"> <a href="#" class="name">'
            + '<small class="text-muted pull-right"><i class="fa fa-clock-o"></i> '
            + time
            + '</small> Avengers </a>'
            + question
            + ' </p> </div>');

            item.hide();
            $('#chat-list').append(item);
            item.show('slow');

            $.get('api/watson/'+question, function(result) {
                console.log(result);

                var answers = result.answer || [];
                answers.forEach(function(answer) {
                    var item = $('<div class="item"> <img src="images/watson-avatar.jpg" alt="user image" class="online" />'
                    + '<p class="message"> <a href="#" class="name">'
                    + '<small class="text-muted pull-right"><i class="fa fa-clock-o"></i> '
                    + time
                    + '</small> Watson </a>'
                    + '<span class="badge bg-green pull-left">' + answer.confidence + '</span><br>'
                    + answer.text
                    + ' </p> </div>');

                    item.hide();
                    $('#chat-list').append(item);
                    item.show('slow');
                });
            });
        }
    });

    var areaDiseaseLine = new Morris.Line({
        element: 'disease-area-chart',
        resize: true,
        data: [],
        xkey: 'y',
        ykeys: ['historical', 'future'],
        labels: ['Historical', 'Future'],
        lineColors: ['#efefef', "#ff851b"],
        lineWidth: 2,
        hideHover: 'auto',
        gridTextColor: "#fff",
        gridStrokeWidth: 0.4,
        pointSize: 4,
        pointFillColors: ["#efefef", "#ff851b"],
        pointStrokeColors: ["#efefef", "#ff851b"],
        gridLineColor: "#efefef",
        gridTextFamily: "Open Sans",
        gridTextSize: 10
    });

    $("#btn-predict").click(function() {
        var area = $('#areas').val();
        var disease = $('#diseases').val();

        if(!area || !disease) {
            alert('Please select State and Disease first!');
            return;
        }

        $('#prediction .overlay').show();

        $.get('http://127.0.0.1:5000/' + area + '/' + disease, function(predictions) {
            $('#prediction .overlay').hide();

            $('#disease-chart').show('slow', function() {
                $.get('/api/count/'+disease+'/'+area, function(result){
                    console.log(result);
                    if(result && result.Data) {


                        var futures = JSON.parse(predictions) || [];
                        console.log(futures);

                        var maxPeriod = _.max(result.Data, function (item) {
                            return item.Year * 100 + item.Week;
                        });

                        console.log(maxPeriod);

                        var getNextPeriod = function (currentPeriod, count) {
                            if (currentPeriod.Year == 2014 && currentPeriod.Week == 53) {
                                return {Year: currentPeriod.Year + 1, Week: 1, Future: count};
                            } else {
                                return {Year: currentPeriod.Year, Week: currentPeriod.Week + 1, Future: count};
                            }
                        };

                        if(futures[0]) {
                            var nextPeriod = getNextPeriod(maxPeriod);
                            $('#predictionInfo1 .info-box-text').text(nextPeriod.Year + ' Week ' + nextPeriod.Week);
                            $('#predictionInfo1 .info-box-number').text(futures[0]);
                        }

                        futures.forEach(function (count) {
                            var nextPeriod = getNextPeriod(maxPeriod, count);
                            result.Data.push(nextPeriod);
                            maxPeriod = nextPeriod;
                        });

                        if(futures[1]) {
                            $('#predictionInfo2 .info-box-text').text(maxPeriod.Year + ' Week ' + maxPeriod.Week);
                            $('#predictionInfo2 .info-box-number').text(futures[1]);
                        }

                        areaDiseaseLine.setData(result.Data.map(function (item) {
                            var o = {y: item.Year + ' W' + item.Week};
                            if (item.Count) {
                                o.historical = item.Count;
                            }
                            if (item.Future) {
                                o.future = item.Future;
                            }
                            return o;
                        }));
                    }
                });

            });

        }).fail(function() {
            $('#disease-chart').hide();
            areaDiseaseLine.setData([]);
            $('#predictionInfo1 .info-box-text').text('');
            $('#predictionInfo1 .info-box-number').text('N/A');
            $('#predictionInfo2 .info-box-text').text('');
            $('#predictionInfo2 .info-box-number').text('N/A');
        }).always(function(){
            $('#prediction .overlay').hide();
            var predictions = '[2,2]';
            $('#disease-chart').show('slow', function() {
                $.get('/api/count/' + disease + '/' + area, function (result) {
                    console.log(result);
                    if (result && result.Data) {


                        var futures = JSON.parse(predictions) || [];
                        console.log(futures);

                        var maxPeriod = _.max(result.Data, function (item) {
                            return item.Year * 100 + item.Week;
                        });

                        console.log(maxPeriod);

                        var getNextPeriod = function (currentPeriod, count) {
                            if (currentPeriod.Year == 2014 && currentPeriod.Week == 53) {
                                return {Year: currentPeriod.Year + 1, Week: 1, Future: count};
                            } else {
                                return {Year: currentPeriod.Year, Week: currentPeriod.Week + 1, Future: count};
                            }
                        };

                        if (futures[0]) {
                            var nextPeriod = getNextPeriod(maxPeriod);
                            $('#predictionInfo1 .info-box-text').text(nextPeriod.Year + ' Week ' + nextPeriod.Week);
                            $('#predictionInfo1 .info-box-number').text(futures[0]);
                        }

                        futures.forEach(function (count) {
                            var nextPeriod = getNextPeriod(maxPeriod, count);
                            result.Data.push(nextPeriod);
                            maxPeriod = nextPeriod;
                        });

                        if (futures[1]) {
                            $('#predictionInfo2 .info-box-text').text(maxPeriod.Year + ' Week ' + maxPeriod.Week);
                            $('#predictionInfo2 .info-box-number').text(futures[1]);
                        }

                        areaDiseaseLine.setData(result.Data.map(function (item) {
                            var o = {y: item.Year + ' W' + item.Week};
                            if (item.Count) {
                                o.historical = item.Count;
                            }
                            if (item.Future) {
                                o.future = item.Future;
                            }
                            return o;
                        }));
                    }
                });
            });
        });
    });

    var map = null;

    var bar = new Morris.Bar({
        element: 'bar-chart',
        resize: true,
        data: [],
        barColors: ['#00a65a'],
        xkey: 'y',
        ykeys: ['count'],
        labels: ['Count'],
        hideHover: 'auto',
        stacked: true
    });


    $('#btn-view').click(function(e) {
        e.preventDefault();
        var disease = $('#disease').val();

        if (!disease) {
            alert('Please select Disease first!');
            return;
        }

        $('#us-map').show('slow', function() {
            $.get('api/sum/disease/' + disease, function (result) {
                var markers = result.Data.map(function (area) {
                    return {latLng: [area.Latitude, area.Longitude], name: area.Area};
                });

                var data = {};

                result.Data.forEach(function(area){
                    data['US-' + area.State] = area.Count;
                });

                console.log(data);

                if(map) $('#us-map').replaceWith('<div id="us-map" style="height: 300px; width: 100%"></div>');
                map = $('#us-map').vectorMap({
                    map: 'us_mill_en',
                    backgroundColor: "transparent",
                    regionStyle: {
                        initial: {
                            fill: '#e4e4e4',
                            "fill-opacity": 1,
                            stroke: 'none',
                            "stroke-width": 0,
                            "stroke-opacity": 1
                        }
                    },
                    series: {
                        regions: [{
                            values: data,
                            scale: ["#ebf4f9", "#92c1dc"],
                            normalizeFunction: 'polynomial'
                        }]
                    },
                    onRegionLabelShow: function (e, el, code) {
                        el.html(el.html() + ', Count: ' + data[code]);
                    }
                });

                var data_bar = result.Data.map(function(area){
                    return {y: area.Area, count: area.Count};
                });

                console.log(data_bar);

                $('#bar-chart').show('slow', function() {
                    bar.setData(data_bar);
                });

            });
        });

    });







    //Donut Chart
    var donut = new Morris.Donut({
        element: 'group-donut-chart',
        resize: true,
        colors: ["#3c8dbc", "#f56954", "#00a65a"],
        data: [],
        //    [
        //    {label: "Download Sales", value: 12},
        //    {label: "In-Store Sales", value: 30},
        //    {label: "Mail-Order Sales", value: 20}
        //]
        hideHover: 'auto',
        gridTextColor: "#fff"

    });

    var group_disease_line = null;


    $('#btn-view2').click(function(e) {
        e.preventDefault();
        var area = $('#area2').val();
        var group = $('#disease_groups').val();

        if (!area || !group) {
            alert('Please select Area and Group first!');
            return;
        }

        $('#group-donut-chart').show('slow', function() {
            $.get('/api/group/'+group+'/'+area, function(result) {
                console.log(result);
                if (result && result.Data) {

                    var donut = new Morris.Donut({
                        element: 'group-donut-chart',
                        resize: true,
                        data: result.Data.map(function(item){return {label: item.Disease.replace(result.Group, ''), value: item.Count};}),
                        hideHover: 'auto',
                        gridTextColor: "#fff"

                    });
                    //donut.setData(result.Data.map(function(item){
                    //    return {label: item.Disease, value: item.Count};
                    //}));
                }
            });
        });

        $('#group-disease-chart').show('slow', function() {
            $.get('api/count/area/' + area, function (result) {
                var data = {};
                var diseases = [];
                var final = [];

                result.Data.forEach(function (item) {
                    if (diseases.indexOf(item.Disease) < 0) diseases.push(item.Disease);
                    var key = item.Year + ' W' + item.Week;
                    if (!data[key]) {
                        data[key] = {};
                    }
                    data[key][item.Disease] = item.Count;
                });

                $.get('api/groups/'+group, function(group){
                    diseases = _.filter(diseases, function(disease){
                        return group.Data.indexOf(disease) >= 0;
                    });
                }).fail(function(){
                    diseases = _.shuffle(diseases).slice(0, 5);
                }).always(function(){
                    Object.getOwnPropertyNames(data).forEach(function (week) {
                        var item = {y: week};
                        diseases.forEach(function (disease) {
                            item[disease] = data[week][disease] || 0;
                        });
                        final.push(item);
                    });

                    console.log(final);

                    if(group_disease_line) $('#group-disease-chart').replaceWith('<div class="chart tab-pane active" id="group-disease-chart" style="position: relative; height: 300px"></div>');

                    group_disease_line = new Morris.Line({
                        element: 'group-disease-chart',
                        resize: true,
                        data: final,
                        xkey: 'y',
                        ykeys: diseases,
                        labels: diseases,
                        lineWidth: 2,
                        hideHover: 'auto',
                        gridTextColor: "#fff",
                        gridStrokeWidth: 0.4,
                        pointSize: 4,
                        pointStrokeColors: ["#efefef"],
                        gridLineColor: "#efefef",
                        gridTextFamily: "Open Sans",
                        gridTextSize: 10
                    });
                });

            });
        });
    });

});