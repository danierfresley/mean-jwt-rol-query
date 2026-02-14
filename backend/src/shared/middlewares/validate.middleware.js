const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ ok: false, message });
  }

  req.body = value;
  next();
};

module.exports = validate;
