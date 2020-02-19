var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// default options
app.use(fileUpload());
// models
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;    

    // tipos de coleccion
    var tiposValidos = ['medicos', 'usuarios', 'hospitales'];
    if( tiposValidos.indexOf( tipo ) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no válida' }
        });
    }

    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[ nombreCortado.length -1 ];

    // Solo estas extenciones se aceptan
    var extensionesValidas = [ 'png', 'jpg', 'gif', 'jpeg' ];

    if( extensionesValidas.indexOf( extensionArchivo ) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones permitidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado = idUsuario-numRandom.ext
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path especifico
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv( path, err => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );

    });
    
});

function subirPorTipo( tipo, id, nombreArchivo, res ) {

    if( tipo === 'usuarios' ){
        Usuario.findById(id, (err, usuario) => {
            if( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe elimina la imagen anterior
            if( fs.existsSync( pathViejo ) ) {
                fs.unlinkSync( pathViejo );
            }

            usuario.img = nombreArchivo;
            usuario.save( (err, usuarioActualizado) => {
                if( err ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar usuario',
                        errors: err
                    });
                }

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if( tipo === 'medicos' ) {
        Medico.findById(id, (err, medico) => {
            if( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe elimina la imagen anterior
            if( fs.existsSync( pathViejo ) ) {
                fs.unlinkSync( pathViejo );
            }

            medico.img = nombreArchivo;
            
            medico.save( (err, medicoActualizado) => {
                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar medico',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });

        });
    }

    if( tipo === 'hospitales' ) {
        Hospital.findById(id, (err, hospital) => {
            if( err ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe elimina la imagen anterior
            if( fs.existsSync( pathViejo ) ) {
                fs.unlinkSync( pathViejo );
            }

            hospital.img = nombreArchivo;

            hospital.save( (err, hospitalActualizado) => {
                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }

}

module.exports = app;