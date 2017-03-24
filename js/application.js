$(document).ready(function () {
  document.getElementById('txtFileUpload').addEventListener('change', upload, false);

  function browserSupportFileUpload() {
    var isCompatible = false;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      isCompatible = true;
    }
    return isCompatible;
  }

  function upload(evt) {
    if (!browserSupportFileUpload()) {
      alert('The File APIs are not fully supported in this browser!');
    } else {
      var file = evt.target.files[0];
      var reader = new FileReader();
      reader.readAsText(file);

      reader.onload = function (event) {
        var csvData = event.target.result;

        if (csvData && csvData.length > 0) {
          var csvLines = points = [];
          var dayArr = [],
              timeArr = [],
              passedTestsArr = [],
              failedTestsArr = [],
              statusArr = [],
              duration = [],
              abnormal = [];
          csvLines = csvData.split(/[\r?\n|\r|\n]+/);

          for (var i = 1; i < csvLines.length; i++) {
            if (csvLines[i].length > 0) {
              points = csvLines[i].split(',');

              setDataForBuildsPerDayChart(dayArr, passedTestsArr, failedTestsArr, abnormal);
              setDataForDurationChart(timeArr, duration);
            }
          }
          alert('Imported -' + csvLines.length + '- rows successfully!');
          drawBuildsPerDay(dayArr, passedTestsArr, failedTestsArr, abnormal);
          drawDurationVsTime(timeArr, duration);
        } else {
          alert('No data to import!');
        }
      };
      reader.onerror = function () {
        alert('Unable to read ' + file.fileName);
      };
    }
  }

  function setDataForBuildsPerDayChart(dayArr, passedTestsArr, failedTestsArr, abnormal) {
    var summaryStatus = points[3].replace(/["']/g, "");
    var passedTestsField = parseInt(points[11].replace('"', ''));
    var failedTestsField = parseInt(points[12].replace('"', ''));
    const ABNORMAL_ERROR_COUNT = 1;

    if (summaryStatus == "passed") {
      dayArr.push(new Date(points[2]));
      passedTestsArr.push(passedTestsField);
      failedTestsArr.push(0);
      abnormal.push(0);
    } else if (summaryStatus == "failed") {
      dayArr.push(new Date(points[2]));
      passedTestsArr.push(0);
      failedTestsArr.push(failedTestsField);
      if (points[12].replace(/["']/g, "") > ABNORMAL_ERROR_COUNT) {
        abnormal.push(failedTestsField);
      } else {
        abnormal.push(0);
      }
    }
  }
  
  function setDataForDurationChart(timeArr, duration) {
    timeArr.push(new Date(points[2]));
    duration.push(parseFloat(points[4].replace('"', '')));
  };

  function drawBuildsPerDay(dayArr, passedTestsArr, failedTestsArr, abnormal) {
    Highcharts.chart('buildsPerDay', {
      chart: {
        type: 'area'
      },
      title: {
        text: 'Builds Per Day bar chart'
      },
      xAxis: {
        categories: dayArr,
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
        data: passedTestsArr
      }, {
        name: 'Failed',
        data: failedTestsArr
      }, {
        type: 'spline',
        name: 'abnormal',
        data: abnormal,
        marker: {
          lineWidth: 2,
          lineColor: Highcharts.getOptions().colors[3],
          fillColor: 'red'
        }
      }
      ]
    });
  };

  function drawDurationVsTime(timeArr, duration) {
    Highcharts.chart('durationVsTime', {
      chart: {
        type: 'area'
      },
      title: {
        text: 'Duration VS Time bar chart'
      },
      xAxis: {
        categories: timeArr,
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
