<?php

Flight::route('GET /', function(){
    global $neg_id;

    include DEFINITION;

    // Suma una visita para el negocio actual
    perso::visita();

    // Los archivos estan directamente en public/html
    $vista   = VARPATH . '/public/html';
    $base    = isset($varhost) ? $varhost . '/public/html' : '';
    $version = isset($version) ? $version : date('Ymd');

    // ===== Datos del negocio (reg_neg) =====
    $negocio = DB::queryFirstRow("
        SELECT neg_id, nombre, img_logo, celular_informes
        FROM reg_neg
        WHERE neg_id = %i
        LIMIT 1
    ", $neg_id);

    $nombre_negocio   = !empty($negocio['nombre'])           ? $negocio['nombre']           : 'La Bolichera';
    $img_logo         = !empty($negocio['img_logo'])         ? $negocio['img_logo']         : 'https://picsum.photos/seed/bolichera-logo/64/64';
    $celular_informes = isset($negocio['celular_informes'])  ? $negocio['celular_informes'] : '';

    $mis_visitas = perso::obtener_visitas();

    // Arbol completo: negocio, web, pos y sliders
    $data = perso::regentis_rss($neg_id);

    // Variables que usa Mustache en index.html
    $data['base']             = $base;
    $data['version']          = $version;
    $data['mis_visitas']      = $mis_visitas;
    $data['nombre_negocio']   = $nombre_negocio;
    $data['img_logo']         = $img_logo;
    $data['celular_informes'] = $celular_informes;

    // JSON que lee el JS (se imprime con {{{page_data_json}}}, sin escapar)
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_INVALID_UTF8_SUBSTITUTE);
    $data['page_data_json'] = ($json !== false) ? $json : '{"status":"error","msg":"No se pudo serializar los datos"}';

    $partials = isset($partials) ? $partials : [];

    $archivo = $vista . '/index.html';
    if (!is_file($archivo)) {
        http_response_code(500);
        echo 'No existe la plantilla: ' . $archivo;
        return;
    }

    header('Content-Type: text/html; charset=UTF-8');

    echo (new Mustache)->render(
        file_get_contents($archivo),
        $data,
        $partials
    );
});