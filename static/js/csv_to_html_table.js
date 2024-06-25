var CsvToHtmlTable = CsvToHtmlTable || {};

CsvToHtmlTable = {
    init: function (options) {
        options = options || {};
        var csv_path = options.csv_path || "";
        var el = options.element || "table-container";
        var allow_download = options.allow_download || false;
        var csv_options = options.csv_options || {};
        var datatables_options = options.datatables_options || {};
        var custom_formatting = options.custom_formatting || [];
        var customTemplates = {};
        $.each(custom_formatting, function (i, v) {
            var colIdx = v[0];
            var func = v[1];
            customTemplates[colIdx] = func;
        });

        var $table = $("<table class='table table-striped table-condensed' id='" + el + "-table'></table>");
        var $containerElement = $("#" + el);
        $containerElement.empty().append($table);

        $.when($.get(csv_path)).then(
            function (data) {
                var csvData = $.csv.toArrays(data, csv_options);
                var $tableHead = $("<thead></thead>");
                var csvHeaderRow = csvData[0];

                var $tableHeadRow1 = $("<tr></tr>");
                $tableHeadRow1.append($("<th colspan='2'></th>").text("Metadata"));
                $tableHeadRow1.append($("<th colspan='5'></th>").text("Reasoning Questions"));
                $tableHeadRow1.append($("<th colspan='6'></th>").text("Descriptive Questions"));
                $tableHead.append($tableHeadRow1);

                var $tableHeadRow2 = $("<tr></tr>");
                for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
                    $tableHeadRow2.append($("<th></th>").text(csvHeaderRow[headerIdx]));
                }
                $tableHead.append($tableHeadRow2);

                $table.append($tableHead);
                var $tableBody = $("<tbody></tbody>");

                for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
                    var $tableBodyRow = $("<tr></tr>");
                    for (var colIdx = 0; colIdx < csvData[rowIdx].length; colIdx++) {
                        var $tableBodyRowTd = $("<td></td>");
                        var cellTemplateFunc = customTemplates[colIdx];
                        console.log("Processing column: " + colIdx + ", Value: " + csvData[rowIdx][colIdx]);
                        if (cellTemplateFunc) {
                            $tableBodyRowTd.html(cellTemplateFunc(csvData[rowIdx][colIdx]));
                        } else {
                            $tableBodyRowTd.text(csvData[rowIdx][colIdx]);
                        }
                        if (colIdx == 1 || colIdx == 6) {
                            $tableBodyRowTd.css("border-right", "1px solid #dbdbdb");
                        }
                        // if the second column equals to "Close", then set the background color of the row to light red
                        if (colIdx == 1 && csvData[rowIdx][colIdx] == "Close") {
                            $tableBodyRow.css("background-color", "#E8C5E5");
                        }
                        // if the second column equals to "Open", then set the background color of the row to light green
                        if (colIdx == 1 && csvData[rowIdx][colIdx] == "Open") {
                            $tableBodyRow.css("background-color", "#91DDCF");
                        }
                        // if N/A, light blue
                        if (csvData[rowIdx][colIdx] == "N/A") {
                            $tableBodyRow.css("background-color", "#F7F9F2");
                        }


                        $tableBodyRow.append($tableBodyRowTd);
                        $tableBody.append($tableBodyRow);
                    }
                }
                $table.append($tableBody);
                $table.DataTable(datatables_options);
                if (allow_download) {
                    $containerElement.append("<p><a class='btn btn-info' href='" + csv_path + "'><i class='glyphicon glyphicon-download'></i> Download as CSV</a></p>");
                }
            });
    }
};