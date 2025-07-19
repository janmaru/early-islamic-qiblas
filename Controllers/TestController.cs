﻿using Microsoft.AspNetCore.Mvc;

namespace EarlyIslamicQiblas.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { message = "API works!", timestamp = DateTime.Now });
    }
}