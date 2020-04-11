var express = require('express');
var mdAutentication = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// Rutas

// =======================
// Obtener hospitales
// =======================
app.get('/', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, 'nombre img usuario')
            .skip(desde)
            .limit(10)
            .populate('usuario', 'nombre email')
            .exec(
                (err, hospitales) => {
                    if( err ) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando hospital',
                            errors: err
                        });
                    }
                    Hospital.count({}, (err, conteo) =>{
                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
                            total: conteo
                        });
                    });
                });
});

// =======================
// Actualizar hospital
// =======================
app.put('/:id', mdAutentication.verificaToken, ( req, res ) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findByIdAndUpdate( id, mdAutentication.verificaToken, (err, hospital) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if( !hospital ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el ID '+ id +' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        // hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado) => {
            if( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// =======================
// Crear hospital
// =======================
app.post('/', mdAutentication.verificaToken, ( req, res ) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) => {
        if( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            body: hospitalGuardado
        });
    });
});

// =======================
// Eliminar hospital
// =======================
app.delete('/:id', mdAutentication.verificaToken, ( req, res ) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar hospital',
                errors: err
            });
        }

        if( !hospitalBorrado ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
            .populate('usuario', 'nombre img email')
            .exec((err, hospital) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar hospital',
                        errors: err
                    });
                }
                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El hospital con el id ' + id + 'no existe',
                        errors: { message: 'No existe un hospital con ese ID' }
                    });
                }
                res.status(200).json({
                    ok: true,
                    hospital: hospital
                });
            });
});


module.exports = app;