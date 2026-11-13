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

    // --- Extracción de Metadatos y Favicon desde la estructura web ---
    $meta_titulo = $nombre_negocio;
    $meta_keywords = '';
    $meta_description = '';
    $favicon_url = $img_logo;

    if (!empty($data['web']) && is_array($data['web'])) {
        foreach ($data['web'] as $cat) {
            // Buscamos dentro de las subcategorías (ej. txt_meta_cat)
            if (!empty($cat['subcategorias']) && is_array($cat['subcategorias'])) {
                foreach ($cat['subcategorias'] as $sub) {
                    if (!empty($sub['items']) && is_array($sub['items'])) {
                        foreach ($sub['items'] as $item) {
                            if ($item['clave_txt'] === 'txt_titulo' && !empty($item['contenido'])) {
                                $meta_titulo = $item['contenido'];
                            }
                            if ($item['clave_txt'] === 'txt_meta_keywords' && !empty($item['contenido'])) {
                                $meta_keywords = $item['contenido'];
                            }
                            if ($item['clave_txt'] === 'txt_meta_description' && !empty($item['contenido'])) {
                                $meta_description = $item['contenido'];
                            }
                            // Favicon obtenido de la imagen del dueño / responsable (txt_dueno_restaurante)
                            if ($item['clave_txt'] === 'txt_dueno_restaurante' && !empty($item['imagenes'])) {
                                foreach ($item['imagenes'] as $img) {
                                    if (!empty($img['url_img'])) {
                                        $favicon_url = $img['url_img'];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Variables que usa Mustache en index.html
    $data['base']             = $base;
    $data['version']          = $version;
    $data['mis_visitas']      = $mis_visitas;
    $data['nombre_negocio']   = $nombre_negocio;
    $data['img_logo']         = $img_logo;
    $data['celular_informes'] = $celular_informes;
    
    // Variables de metadatos y favicon para Mustache
    $data['meta_titulo']       = $meta_titulo;
    $data['meta_keywords']     = $meta_keywords;
    $data['meta_description']  = $meta_description;
    $data['favicon_url']       = $favicon_url;

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