const authguard = require('../customeDependencies/authguard')
const userModel = require('../models/userModel')
const employeeModel = require('../models/employeeModel')
const bcrypt = require('bcrypt')
const mainRouter = require('express').Router()
const upload = require('../customeDependencies/uploads')

mainRouter.get('/homepage', (req, res) => {
    try {
        res.render('home/homePage.twig',
        {
            title: "inscription - entreprise"
        })
    } catch (error) {
        res.send(error)
    }
})

mainRouter.get('/subscribe', (req, res) => {
    try {
        res.render('home/subscribe.twig',
        {
            title: "inscription - entreprise"
        })
    } catch (error) {
        res.send(error)
    }
})

mainRouter.post('/subscribe', async (req, res) => {
        try {
            const user = new userModel(req.body);
            user.validateSync()
            await user.save();
            res.redirect('/login')
        } catch (error) {
            console.log(error);
            res.render('home/subscribe.twig', 
            {
                error: error.errors,
                title: "inscription - entreprise"
            })
        }
})

mainRouter.get('/login', (req, res) => {
    res.render('login/loginPage.twig',
    {
        title: "connexion - entreprise"
    })
})

mainRouter.post('/login', async (req, res) => {
    try {
        let user = await userModel.findOne({ mail: req.body.mail })
      
        if(user) {
            console.log(await bcrypt.compare(req.body.password, user.password));
            if (await bcrypt.compare(req.body.password, user.password)) {
                req.session.userId = user._id
                res.redirect('/dashboard')
            }else {
                throw {password: "Mot de passe incorrect"}
            }
        } else{
            throw {mail: "Ce mail n'existe pas"}
        }
    } catch (error) {
        console.log(error);
        res.render('login/loginPage.twig', 
        {
            title: "connexion - entreprise",
            error : error
        })
    }
})

mainRouter.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/login");
  });


mainRouter.get('/dashboard', authguard, async(req, res) => {
    const filter = req.query.function
    const user =  await userModel.findById(req.session.userId).populate({
        path: "employeeCollection",
        match: filter ? { function: { $regex: new RegExp(`^${filter}`, 'i') } } : {}})
    res.render('dashboard/dashboard.twig',
    {
        user: user,
        title: "dashboard - entreprise"
    })
})

mainRouter.get('/addEmployee', authguard, async(req, res) => {
    res.render('add/addEmployee.twig', 
    {
        title: "Ajouter un employé - entreprise",
        user: await userModel.findById(req.session.userId)
    })
})

mainRouter.post('/addEmployee', authguard, upload.single('image'), async(req, res) => {
    try {
        let employee = new employeeModel(req.body)
        employee.blame = 0;
        if (req.file) {
            employee.image = req.file.filename
        }
        console.log(employee);
        employee._user = req.session.userId
        employee.validateSync()
        await employee.save()
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
        res.render('add/addEmployee.twig', 
        {
            title: "add/addEmployee.twig",
            user: await userModel.findById(req.session.userId),
            error: error,
        })
    }
})

mainRouter.get('/employeeDelete/:employeeid', authguard, async(req, res) => {
    try {
        await employeeModel.deleteOne({ _id: req.params.employeeid})
        res.redirect("/dashboard")
    } catch (error) {
        res.render('dashboard/dashboard.twig',
        {
            errorDelete: "Un probleme est survenu lors de la suppression",
            user: await userModel.findById(req.session.userId).populate("employeeCollection"),
            title: "dashboard - entreprise"
        })
    }
})

mainRouter.get('/employeeUpdate/:employeeid', authguard, async (req, res) => {
    try {
        let employee = await employeeModel.findById(req.params.employeeid);
        res.render('add/addEmployee.twig',
        {
            title: "Modifier employé - entreprise",
            user: await userModel.findById(req.session.userId),
            employee: employee
        })
    } catch (error) {
        console.log(error);
        res.render('dashboard/dashboard.twig',
        {
            errorMessage: "L'employé que vous souhaitez modifier n'existe pas",
            user: await userModel.findById(req.session.userId),
            title: "dashboard - entreprise"
        })
    }
})

mainRouter.post('/employeeUpdate/:employeeid', upload.single("image"), authguard, async (req, res) => {
    try {
        if (req.file) {
            req.body.image = req.file.filename
        }
        let employee = await employeeModel.updateOne({_id:  req.params.employeeid},req.body);
       
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
        let employee = await employeeModel.findById(req.params.employeeid);       
        res.render('add/addEmployee.twig',
        {
            title: "Modifier employé - entreprise",
            user: await userModel.findById(req.session.userId),
            employee: employee
        })
    }
})

mainRouter.get(
    "/blameEmployee/:employeeid",
    authguard,
    async (req, res) => {
      try {
        let employee = await employeeModel.findById(req.params.employeeid);
        if (employee) {
          employee.blame += 1;
          if (employee.blame >= 3) {
            await employeeModel.deleteOne({ _id: req.params.employeeid });
          } else {
            employee.save();
          }
        }
        res.redirect("/dashboard");
      } catch (error) {
        console.log(error);
        res.render("dashboard/dashboard.twig");
      }
    }
  );

module.exports = mainRouter