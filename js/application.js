$(document).ready(function () {
    $('#csvFileUpload').on('change', function(evt) {
        var file = evt.target.files[0],
            csvData,
            csvHeaders;

        Papa.parse(file, {
            header: true,
            complete: function(results) {
                csvData = results.data;
                csvHeaders = results.meta.fields;
                setDataForCharts();
            }
        });

        function setDataForCharts() {
            if (csvData.length > 0) {
                setDataForBuildsPerDayChartAndDraw(csvData, csvHeaders);
                setDataForDurationChartAndDraw(csvData);
                alert('Imported -' + csvData.length + '- rows successfully!');
            } else {
                alert('No data to import!');
            }
        };
    });

    function setDataForBuildsPerDayChartAndDraw(csvData, headers) {
        var xAxis = [],
            summary = {
                passed:  [],
                failed:  [],
                error:   [],
                stopped: []
            },
            dateFieldName = "created_at",
            summaryFieldName = "summary_status";

        for (var i = 0; i < csvData.length; i++) {
            xAxis.push(new Date(csvData[i][dateFieldName]));

            $.each(summary, function(index) {
                if (index == "stopped") {
                    if (csvData[i][summaryFieldName] != "passed"
                        && csvData[i][summaryFieldName] != "failed"
                        && csvData[i][summaryFieldName] != "error") {
                        summary[index].push(1);
                    } else {
                        summary[index].push(0);
                    }
                } else {
                csvData[i][summaryFieldName] == index ? summary[index].push(1) : summary[index].push(0);
                }
            });
        }

        drawBuildsPerDay(xAxis, summary);
    }

    function setDataForDurationChartAndDraw(csvData) {
        var xAxis = [],
            duration = [],
            dateFieldName = "created_at",
            durationField = 'duration';

        for (var i = 0; i < csvData.length; i++) {
            xAxis.push(new Date(csvData[i][dateFieldName]));
            duration.push(parseFloat(csvData[i][durationField]));
        }

        drawDurationVsTime(xAxis, duration);
    };

    function drawBuildsPerDay(xAxis, summary) {
        Highcharts.chart('buildsPerDay', {
            chart: {
                type: 'area'
            },
            title: {
                text: 'Builds Per Day bar chart'
            },
            xAxis: {
                categories: xAxis,
                tickmarkPlacement: 'on',
                title: {
                    enabled: false
                }
            },
            yAxis: {
                title: {
                    text: 'Number'
                },
                labels: {
                    formatter: function () {
                        return this.value;
                    }
                }
            },
            tooltip: {
                split: true,
                valueSuffix: ' tests'
            },
            plotOptions: {
                area: {
                    stacking: 'normal',
                    lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1,
                        lineColor: '#666666'
                    }
                }
            },
            series: [{
                name: 'Passed',
                data: summary.passed
            }, {
                name: 'Failed',
                data: summary.failed
            }, {
                name: 'Error',
                data: summary.error
            }, {
                name: 'Stopped',
                data: summary.stopped
            }]
        });
    };

    function drawDurationVsTime(xAxis, duration) {
        Highcharts.chart('durationVsTime', {
            chart: {
                type: 'area'
            },
            title: {
                text: 'Duration VS Time bar chart'
            },
            xAxis: {
                categories: xAxis,
                tickmarkPlacement: 'on',
                title: {
                    enabled: false
                }
            },
            yAxis: {
                title: {
                    text: 'Duration'
                },
                labels: {
                    formatter: function () {
                        return this.value;
                    }
                }
            },
            tooltip: {
                split: true,
                valueSuffix: ' points'
            },
            plotOptions: {
                area: {
                    stacking: 'normal',
                    lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1,
                        lineColor: '#666666'
                    }
                }
            },
            series: [{
                name: 'Time',
                data: duration
            }]
        });
    };
});
