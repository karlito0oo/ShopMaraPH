<?php

namespace App\Services;

use Exception;
use Google\Client;
use Google\Service\Sheets;
use Google\Service\Sheets\ValueRange;
use Google\Service\Sheets\BatchUpdateSpreadsheetRequest;
use Google\Service\Sheets\Request;
use Google\Service\Sheets\RepeatCellRequest;
use Google\Service\Sheets\CellData;
use Google\Service\Sheets\CellFormat;
use Google\Service\Sheets\Color;

class GoogleSheetsService
{
    protected $client;
    protected $service;
    protected $spreadsheetId = '1Ws3QFjM8SY_PnbbTXc37C5GGKmTmmXcHvFvrVFI3gLY';

    public function __construct()
    {
        try {
            $this->client = new Client();
            $this->client->setApplicationName('ShopMaraPH');
            $this->client->setScopes([Sheets::SPREADSHEETS]);
            $this->client->setAuthConfig(storage_path('app/google-credentials.json'));

            $this->service = new Sheets($this->client);
        } catch (Exception $e) {
            \Log::error('Google Sheets Service initialization failed: ' . $e->getMessage());
            throw new Exception('Failed to initialize Google Sheets service: ' . $e->getMessage());
        }
    }

    public function appendOrderData($order)
    {
        $fullAddress = implode(', ', array_filter([
            $order->address_line1,
            $order->barangay,
            $order->city,
            $order->province
        ]));

        $values = [
            [
                now()->format('Y-m-d H:i:s'), // when order was approved
                $order->instagram_username,
                $order->customer_name,
                $order->mobile_number,
                $fullAddress,
                $order->province,
                $order->city,
                $order->barangay
            ]
        ];

        $range = 'Order Responses!A:H'; // Specify columns A through H
        $body = new ValueRange([
            'values' => $values
        ]);

        $params = [
            'valueInputOption' => 'RAW',
            'insertDataOption' => 'INSERT_ROWS'
        ];

        // Append the row
        $result = $this->service->spreadsheets_values->append(
            $this->spreadsheetId,
            $range,
            $body,
            $params
        );

        // Get the row number that was just added
        $updatedRange = $result->getUpdates()->getUpdatedRange();
        preg_match('/!A(\d+):/', $updatedRange, $matches);
        if (!isset($matches[1])) {
            throw new Exception('Could not determine the updated row number');
        }
        $rowIndex = (int)$matches[1];

        // Format the newly added row with red background
        $requests = [
            new Request([
                'repeatCell' => [
                    'range' => [
                        'sheetId' => 94104767, // Your sheet ID from the URL
                        'startRowIndex' => $rowIndex - 1,
                        'endRowIndex' => $rowIndex,
                        'startColumnIndex' => 0,
                        'endColumnIndex' => 8
                    ],
                    'cell' => new CellData([
                        'userEnteredFormat' => new CellFormat([
                            'backgroundColor' => new Color([
                                'red' => 1.0,
                                'green' => 0.8,
                                'blue' => 0.8
                            ])
                        ])
                    ]),
                    'fields' => 'userEnteredFormat.backgroundColor'
                ]
            ])
        ];

        $batchUpdateRequest = new BatchUpdateSpreadsheetRequest([
            'requests' => $requests
        ]);

        $this->service->spreadsheets->batchUpdate(
            $this->spreadsheetId,
            $batchUpdateRequest
        );

        return $result;
    }
}
